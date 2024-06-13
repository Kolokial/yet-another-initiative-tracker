import { Injectable } from '@angular/core';
import { Observable, ReplaySubject } from 'rxjs';
import { SignalingService } from './signaling.service';

export type Envelope = {
  peerId: string;
  message: string;
  timestamp: number;
  displayName: string;
  isProfileUpdate?: boolean;
};

@Injectable({
  providedIn: 'root',
})
export class MessagingService {
  private _roomId: string = '';
  public get roomId(): string {
    return this._roomId;
  }

  public get myPeerId(): string {
    return this.signalingService.myPeerId;
  }

  private _messageStream: ReplaySubject<Envelope> = new ReplaySubject<Envelope>();
  public get messageStream(): Observable<Envelope> {
    return this._messageStream.asObservable();
  }

  private _displayName: string = '';
  set displayName(name: string) {
    this._displayName = name;
    localStorage.setItem('displayName', name);
  }

  get displayName(): string {
    this._displayName = localStorage.getItem('displayName') ?? '';
    return this._displayName;
  }

  private messageEnvelopes: { [timestamp: string]: Envelope } = {};

  constructor(private signalingService: SignalingService) {
    this.signalingService.dataChannelSubject.subscribe((dataChannel) => {
      if (dataChannel) {
        this.setupDataChannel(dataChannel);
      }
    });
  }

  sendMessage(message: string) {
    /*
      To do: handle sendMessage being called before readyState is set to open.
      Perhaps queuing up messages?
    
    */
    for (const peerId of Object.keys(this.signalingService.peerConnections)) {
      const dataChannel = this.signalingService.dataChannels[peerId];
      if (dataChannel && dataChannel.readyState === 'open') {
        const envelope: Envelope = {
          peerId: this.myPeerId,
          message: message,
          timestamp: Date.now(),
          displayName: this.displayName,
        };
        this.updateMessageStream(envelope);
        dataChannel.send(JSON.stringify(envelope));
      }
    }
  }

  private setupDataChannel(dataChannel: RTCDataChannel) {
    dataChannel.onopen = (event: Event) => {
      //this.populateMessageStream();
      console.log('Data channel open', event);
      this.sendProfileUpdate(dataChannel);
    };

    dataChannel.onmessage = (event: MessageEvent) => {
      if (event.data.sender !== this.myPeerId) {
        const envelope: Envelope = JSON.parse(event.data);
        this.updateMessageStream(envelope);
        console.log('Data channel message:', event.data);
      }
    };
  }

  private sendProfileUpdate(dataChannel: RTCDataChannel): void {
    const introduction: Envelope = {
      displayName: this.displayName,
      peerId: this.myPeerId,
      timestamp: Date.now(),
      isProfileUpdate: true,
      message: '',
    };
    dataChannel.send(JSON.stringify(introduction));
  }

  private updateMessageStream(message: Envelope): void {
    this._messageStream.next(message);
    this.messageEnvelopes[message.timestamp] = message;
  }

  private populateMessageStream(): void {
    /* todo move message history into db */
    const displayName: string = localStorage.getItem('displayName') ?? '';
    const messagesJSON: string =
      localStorage.getItem(`${displayName}-${this.roomId}`) ?? '';

    if (messagesJSON) {
      JSON.parse(messagesJSON).forEach((message: Envelope) => {
        // stop duplicating messages
        if (!this.messageEnvelopes[message.timestamp]) {
          this._messageStream.next(message);
        }
      });
    }
  }

  private updateLocalStorageRoomId(roomId: string): void {
    localStorage.setItem('RoomId', roomId);
  }
}
