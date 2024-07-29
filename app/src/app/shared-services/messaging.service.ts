import { Injectable } from '@angular/core';
import { Observable, ReplaySubject, take } from 'rxjs';
import { DataChannelEvents, SignalingService } from './signaling.service';

export type Envelope = {
  peerId: string;
  diceRoll: number;
  timestamp: number;
  displayName: string;
  playerCharacterName?: string;
  isProfileUpdate?: boolean;
  isTurnFinished?: boolean;
};

@Injectable({
  providedIn: 'root',
})
export class MessagingService {
  private _roomId: string = '';
  public get roomId(): string {
    return this._roomId;
  }

  public get myPeerId(): Observable<string> {
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

  get dataChannelClosing$(): Observable<string> {
    return this.signalingService.dataChannelClosing$;
  }

  private messageEnvelopes: { [timestamp: string]: Envelope } = {};

  constructor(private signalingService: SignalingService) {
    this.signalingService.dataChannelEvents$.subscribe((dataChannel) => {
      if (dataChannel) {
        this.setupDataChannel(dataChannel);
      }
    });
  }

  public sendDiceRollMessage(message: number) {
    this.myPeerId.pipe(take(1)).subscribe({
      next: (peerId: string) => {
        const envelope: Envelope = {
          peerId: peerId,
          diceRoll: message,
          timestamp: Date.now(),
          displayName: this.displayName,
        };
        this.sendMessage(envelope);
      },
    });
  }

  public sendTurnFinishedMessage(): void {
    this.myPeerId.pipe(take(1)).subscribe({
      next: (peerId: string) => {
        this.sendMessage({
          peerId: peerId,
          diceRoll: 0,
          timestamp: Date.now(),
          displayName: this._displayName,
          isTurnFinished: true,
        });
      },
    });
  }

  private sendMessage(envelope: Envelope): void {
    for (const peerId of Object.keys(this.signalingService.peerConnections)) {
      const dataChannel = this.signalingService.dataChannels[peerId];
      if (dataChannel && dataChannel.readyState === 'open') {
        this.updateMessageStream(envelope);
        dataChannel.send(JSON.stringify(envelope));
      }
    }
  }

  private setupDataChannel(dataChannel: DataChannelEvents) {
    dataChannel.onOpen.subscribe({
      next: (event: Event) => {
        //this.populateMessageStream();
        console.log('Data channel open', event);
        this.sendProfileUpdate(this.signalingService.dataChannels[dataChannel.peerId]);
      },
    });

    dataChannel.onMessage.subscribe({
      next: (event: MessageEvent) => {
        if (event.data.sender !== this.myPeerId) {
          const envelope: Envelope = JSON.parse(event.data);
          this.updateMessageStream(envelope);
          console.log('Data channel message:', event.data);
        }
      },
    });
  }

  private sendProfileUpdate(dataChannel: RTCDataChannel): void {
    this.myPeerId.pipe(take(1)).subscribe({
      next: (peerId: string) => {
        const introduction: Envelope = {
          displayName: this.displayName,
          peerId: peerId,
          timestamp: Date.now(),
          isProfileUpdate: true,
          diceRoll: 0,
        };
        dataChannel.send(JSON.stringify(introduction));
      },
    });
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
}
