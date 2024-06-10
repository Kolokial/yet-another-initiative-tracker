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
  private set _roomId(roomId: string) {
    this.updateLocalStorageRoomId(roomId);
  }
  private get _roomId(): string {
    return localStorage.getItem('RoomId') ?? '';
  }
  public get roomId(): string {
    return this._roomId;
  }

  private _myPeerId: string = '';
  public get myPeerId(): string {
    return this._myPeerId;
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

  createRoom() {
    this._roomId = Math.random().toString(36).substring(7);
    this.signalingService.joinRoom(this.roomId).subscribe((peerId) => {
      this._myPeerId = peerId;
    });
    alert(`Room created with ID: ${this.roomId}`);
  }

  joinRoom(roomId: string) {
    if (roomId) {
      this._roomId = roomId;
      this.signalingService.joinRoom(this.roomId).subscribe((peerId) => {
        this._myPeerId = peerId;
      });
    }
  }

  joinRoomWithoutId() {
    const roomId = prompt('Enter the room ID to join:');
    if (roomId) {
      this._roomId = roomId;
      this.signalingService.joinRoom(this.roomId).subscribe((peerId) => {
        this._myPeerId = peerId;
      });
    }
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
          displayName: this._displayName,
        };
        this.updateMessageStream(envelope);
        dataChannel.send(JSON.stringify(envelope));
      }
    }
  }

  private setupDataChannel(dataChannel: RTCDataChannel) {
    dataChannel.onopen = (event: Event) => {
      this.populateMessageStream();
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
      displayName: this._displayName,
      peerId: this._myPeerId,
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
