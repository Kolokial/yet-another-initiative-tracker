import { Injectable } from '@angular/core';
import { Observable, ReplaySubject, take } from 'rxjs';
import { DataChannelEvents, SignalingService } from './signaling.service';
import { AppServiceStore } from '../app.service.store';
import { Envelope, DiceRollMessage, ProfileUpdateMessage } from '../types/messages';

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

  private _messageStream = new ReplaySubject<Envelope<DiceRollMessage>>();
  public get messageStream(): Observable<Envelope<DiceRollMessage>> {
    return this._messageStream.asObservable();
  }

  private _profileMessageStream = new ReplaySubject<Envelope<ProfileUpdateMessage>>();
  public get profileMessageStream(): Observable<Envelope<ProfileUpdateMessage>> {
    return this._profileMessageStream.asObservable();
  }

  get displayName(): string {
    return this.appServiceStore.displayName.getValue();
  }

  get dataChannelClosing$(): Observable<string> {
    return this.signalingService.dataChannelClosing$;
  }

  constructor(
    private appServiceStore: AppServiceStore,
    private signalingService: SignalingService
  ) {
    this.signalingService.onDataChannelAdded$.subscribe((dataChannelEventsCollection) => {
      dataChannelEventsCollection.DiceChannel;

      if (dataChannelEventsCollection) {
        this.setupDiceChannelEventsSubscriptions(dataChannelEventsCollection.DiceChannel);
        this.setupProfileChannelEventsSubscriptions(
          dataChannelEventsCollection.ProfileChannel
        );
      }
    });
  }

  public sendDiceRollMessage(message: number) {
    this.myPeerId.pipe(take(1)).subscribe({
      next: (peerId: string) => {
        const envelope: Envelope<DiceRollMessage> = {
          peerId: peerId,
          message: {
            diceRoll: message,
            isTurnFinished: false,
          },
          timestamp: Date.now(),
        };
        for (const peerId of Object.keys(this.signalingService.peerConnections)) {
          const diceRollChannel = this.signalingService.dataChannels[peerId].DiceChannel;

          this.sendMessage(envelope, diceRollChannel as RTCDataChannel);
        }
      },
    });
  }

  public sendTurnFinishedMessage(): void {
    this.myPeerId.pipe(take(1)).subscribe((peerId: string) => {
      for (const peerId of Object.keys(this.signalingService.peerConnections)) {
        const profileChannel = this.signalingService.dataChannels[peerId].ProfileChannel;
        this.sendMessage<DiceRollMessage>(
          {
            peerId: peerId,
            timestamp: Date.now(),
            message: {
              isTurnFinished: true,
              diceRoll: -1,
            },
          },
          profileChannel as RTCDataChannel
        );
      }
    });
  }

  private sendMessage<T>(envelope: Envelope<T>, dataChannel: RTCDataChannel): void {
    if (dataChannel && dataChannel.readyState === 'open') {
      dataChannel.send(JSON.stringify(envelope));
    }
  }

  private setupDiceChannelEventsSubscriptions(
    diceChannelEvents: DataChannelEvents<DiceRollMessage>
  ) {
    const peerId = diceChannelEvents.peerId;
    const diceChannel = this.signalingService.dataChannels[peerId].DiceChannel;
    diceChannelEvents.onOpen.subscribe({
      next: (event: Event) => {
        console.log('Dice channel open', event);
      },
    });

    diceChannelEvents.onMessage.subscribe({
      next: (event: MessageEvent) => {
        if (event.data.sender !== this.myPeerId) {
          const envelope: Envelope<DiceRollMessage> = JSON.parse(event.data);
          console.log('Dice channel message:', event.data);
        }
      },
    });
  }

  private setupProfileChannelEventsSubscriptions(
    profileChannelEvents: DataChannelEvents<ProfileUpdateMessage>
  ) {
    const peerId = profileChannelEvents.peerId;
    const profileChannel = this.signalingService.dataChannels[peerId].ProfileChannel;
    if (profileChannel) {
      profileChannelEvents.onOpen.subscribe((event: Event) => {
        console.log('Profile channel open');
        this.sendProfileUpdate(profileChannel);
      });
    }
    profileChannelEvents.onMessage.subscribe((event: MessageEvent) => {
      if (event.data.sender !== this.myPeerId) {
        this._profileMessageStream.next(JSON.parse(event.data));
      }
    });
  }

  private sendProfileUpdate(profileChannel: RTCDataChannel): void {
    this.myPeerId.pipe(take(1)).subscribe({
      next: (peerId: string) => {
        const introduction: Envelope<ProfileUpdateMessage> = {
          peerId: peerId,
          timestamp: Date.now(),
          message: {
            displayName: this.displayName,
          },
        };
        profileChannel.send(JSON.stringify(introduction));
      },
    });
  }
}
