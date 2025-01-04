// import { Injectable, Signal } from '@angular/core';
// import { first, Observable, Subject, take } from 'rxjs';
// import { AppServiceStore } from '../app.service.store';
// import { Envelope, RollDiceRequest, ProfileUpdateMessage } from '../types/Messages';
// import { RoomService } from '../components/room/room.service';
// import {
//   DataChannelEventsTraffic,
//   DataChannelInboundEvents,
//   DataChannelOutboundEvents,
// } from '../types/DataChannels';
// import { PlayerCharacter } from '@shared-types/api/PlayerCharacter';
// import { SignalRService } from './signal-r.service';
// import { DateAdapter } from '@angular/material/core';

// @Injectable({
//   providedIn: 'root',
// })
// export class MessagingService {
//   private _roomId: string = '';
//   public get roomId(): string {
//     return this._roomId;
//   }

//   public get myPeerId(): Observable<string> {
//     return this.roomService.myPeerId;
//   }

//   private get displayName(): string {
//     return this.appServiceStore.displayName.getValue();
//   }

//   private get playerCharacter(): PlayerCharacter | null {
//     return this.appServiceStore.selectedCharacter.getValue();
//   }

//   private get isSpectator(): boolean {
//     return this.appServiceStore.isSpectator.getValue();
//   }

//   constructor(
//     private appServiceStore: AppServiceStore,
//     private roomService: RoomService,
//     private signalR: SignalRService
//   ) {
//     this.roomService.onDataChannelAdded$.subscribe((dataChannelEventsCollection) => {
//       dataChannelEventsCollection.DiceChannel;

//       if (dataChannelEventsCollection) {
//         this.setupDiceChannelEventsSubscriptions(dataChannelEventsCollection.DiceChannel);
//         this.setupProfileChannelEventsSubscriptions(
//           dataChannelEventsCollection.PeerId,
//           dataChannelEventsCollection.ProfileChannel
//         );
//       }
//     });
//   }

//   public sendDiceRollMessage(roll: number): void {
//     this.myPeerId.pipe(first()).subscribe({
//       next: (peerId: string) => {
//         const message: RollDiceRequest = {
//           diceRoll: roll,
//         };
//         //this.signalR.invoke('DiceRoll', peerId, message);
//       },
//     });
//   }

//   public sendTurnFinishedMessage(): void {
//     this.myPeerId.pipe(first()).subscribe((peerId: string) => {
//       //this.signalR.invoke('TurnFinished', peerId);
//     });
//   }

//   private setupDiceChannelEventsSubscriptions(
//     diceChannelEvents: DataChannelEventsTraffic<RollDiceRequest>
//   ) {
//     diceChannelEvents.InboundEvents.onOpen.subscribe({
//       next: (event: Event) => {
//         console.log('Dice channel open', event);
//         this.sendDiceRollMessage(this.appServiceStore.lastSentRoll);
//       },
//     });
//   }

//   private setupProfileChannelEventsSubscriptions(
//     peerId: string,
//     profileChannelEvents: DataChannelEventsTraffic<ProfileUpdateMessage>
//   ) {
//     // profileChannelEvents.InboundEvents.onOpen.subscribe((event: Event) => {
//     //   console.log('Profile channel open');
//     //   this.sendProfileUpdateToChannel(profileChannelEvents.OutboundEvents);
//     // });
//   }

//   public sendProfileUpdateToAllChannels() {
//     this.myPeerId.subscribe((myPeerId) => {
//       const message: ProfileUpdateMessage = {
//         displayName: this.appServiceStore.displayName.value,
//         isSpectator: false,
//         playerCharacterName: 'Test',
//       };
//       //this.signalR.invoke('UpdateDisplayName', myPeerId, message);
//     });
//     // Object.keys(this.roomService.dataChannelCollections).forEach((peerId) => {
//     //   const profileChannel =
//     //     this.roomService.dataChannelCollections[peerId].ProfileChannel.OutboundEvents;
//     //   this.sendProfileUpdateToChannel(profileChannel);
//     // });
//   }

//   // private sendProfileUpdateToChannel<T>(
//   //   profileChannel: DataChannelOutboundEvents<ProfileUpdateMessage>
//   // ): void {
//   //   this.myPeerId.pipe(first()).subscribe({
//   //     next: (peerId: string) => {
//   //       const introduction: Envelope<ProfileUpdateMessage> = {
//   //         peerId: peerId,
//   //         timestamp: Date.now(),
//   //         message: {
//   //           displayName: this.displayName,
//   //           playerCharacterName: this.playerCharacter?.characterName,
//   //           isSpectator: this.isSpectator,
//   //         },
//   //       };
//   //       profileChannel.sendMessage(introduction);
//   //     },
//   //   });
//   // }
// }
