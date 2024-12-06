import { Injectable } from '@angular/core';
import { Observable, Subject, take } from 'rxjs';
import { AppServiceStore } from '../app.service.store';
import { Envelope, DiceRollMessage, ProfileUpdateMessage } from '../types/Messages';
import { RoomService } from '../components/room/room.service';
import {
  DataChannelEventsTraffic,
  DataChannelInboundEvents,
  DataChannelOutboundEvents,
} from '../types/DataChannels';
import { PlayerCharacter } from '@shared-types/api/PlayerCharacter';

@Injectable({
  providedIn: 'root',
})
export class MessagingService {
  private _roomId: string = '';
  public get roomId(): string {
    return this._roomId;
  }

  public get myPeerId(): Observable<string> {
    return this.roomService.myPeerId;
  }

  private get displayName(): string {
    return this.appServiceStore.displayName.getValue();
  }

  private get playerCharacter(): PlayerCharacter | null {
    return this.appServiceStore.selectedCharacter.getValue();
  }

  private get isSpectator(): boolean {
    return this.appServiceStore.isSpectator.getValue();
  }

  constructor(
    private appServiceStore: AppServiceStore,
    private roomService: RoomService
  ) {
    this.roomService.onDataChannelAdded$.subscribe((dataChannelEventsCollection) => {
      dataChannelEventsCollection.DiceChannel;

      if (dataChannelEventsCollection) {
        this.setupDiceChannelEventsSubscriptions(dataChannelEventsCollection.DiceChannel);
        this.setupProfileChannelEventsSubscriptions(
          dataChannelEventsCollection.PeerId,
          dataChannelEventsCollection.ProfileChannel
        );
      }
    });
  }

  public sendDiceRollMessage(message: number): void {
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
        for (const peerId of Object.keys(this.roomService.peerConnections)) {
          const diceChannel = this.roomService.dataChannelCollections[peerId].DiceChannel;
          diceChannel.OutboundEvents.sendMessage(envelope);
        }
      },
    });
  }

  public sendTurnFinishedMessage(): void {
    this.myPeerId.pipe(take(1)).subscribe((peerId: string) => {
      const envelope = {
        peerId: peerId,
        timestamp: Date.now(),
        message: {
          isTurnFinished: true,
          diceRoll: -1,
        },
      };
      for (const peerId of Object.keys(this.roomService.peerConnections)) {
        const diceChannel = this.roomService.dataChannelCollections[peerId].DiceChannel;
        diceChannel.OutboundEvents.sendMessage(envelope);
      }
    });
  }

  private setupDiceChannelEventsSubscriptions(
    diceChannelEvents: DataChannelEventsTraffic<DiceRollMessage>
  ) {
    diceChannelEvents.InboundEvents.onOpen.subscribe({
      next: (event: Event) => {
        console.log('Dice channel open', event);
        this.sendDiceRollMessage(this.appServiceStore.lastSentRoll);
      },
    });
  }

  private setupProfileChannelEventsSubscriptions(
    peerId: string,
    profileChannelEvents: DataChannelEventsTraffic<ProfileUpdateMessage>
  ) {
    profileChannelEvents.InboundEvents.onOpen.subscribe((event: Event) => {
      console.log('Profile channel open');

      this.sendProfileUpdateToChannel(profileChannelEvents.OutboundEvents);
    });
  }

  public sendProfileUpdateToAllChannels() {
    Object.keys(this.roomService.dataChannelCollections).forEach((peerId) => {
      const profileChannel =
        this.roomService.dataChannelCollections[peerId].ProfileChannel.OutboundEvents;
      this.sendProfileUpdateToChannel(profileChannel);
    });
  }

  private sendProfileUpdateToChannel<T>(
    profileChannel: DataChannelOutboundEvents<ProfileUpdateMessage>
  ): void {
    this.myPeerId.pipe(take(1)).subscribe({
      next: (peerId: string) => {
        const introduction: Envelope<ProfileUpdateMessage> = {
          peerId: peerId,
          timestamp: Date.now(),
          message: {
            displayName: this.displayName,
            playerCharacterName: this.playerCharacter?.characterName,
            isSpectator: this.isSpectator,
          },
        };
        profileChannel.sendMessage(introduction);
      },
    });
  }
}
