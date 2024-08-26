import { ChangeDetectorRef, Component } from '@angular/core';
import { MessagingService } from '../../shared-services/messaging.service';
import { AsyncPipe, CommonModule, NgFor } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import {
  Observable,
  Subscription,
  combineLatest,
  combineLatestWith,
  map,
  take,
} from 'rxjs';
import { HasTitle } from '../../types/title';
import { AppServiceStore } from 'src/app/app.service.store';
import { Envelope, DiceRollMessage, ProfileUpdateMessage } from 'src/app/types/messages';
import { RoomComponent } from '../room/room.component';
import { RoomData } from 'src/app/types/roomInfo';
import { RoomService } from '../room/room.service';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';

type InitiativeDetail = {
  peerId: string;
  displayName: string;
  playerCharacterName: string;
  initiativeValue: number;
};

@Component({
  selector: 'initiative-list',
  standalone: true,
  imports: [
    CommonModule,
    NgFor,
    MatTableModule,
    AsyncPipe,
    RoomComponent,
    MatIconModule,
    MatButtonModule,
    MatInputModule,
  ],
  templateUrl: './initiative-list.component.html',
  styleUrl: './initiative-list.component.scss',
})
export class InitiativeListComponent implements HasTitle {
  /* Todo: now we need to work out whose turn it is */
  public turnFinishedButtonEnabled$!: Observable<boolean>;
  public initiatives: InitiativeDetail[] = [];
  public displayedColumns: string[] = ['displayName', 'initiativeValue'];

  public get roomId$(): Observable<string> {
    return this.roomService.roomId;
  }

  public get myPeerId$(): Observable<string> {
    return this.roomService.myPeerId;
  }

  public get hasJoinedRoom$(): Observable<boolean> {
    return this.myPeerId$.pipe(
      combineLatestWith(this.roomId$),
      map(([myPeerId, roomId]) => {
        return myPeerId !== '' && roomId !== '';
      })
    );
  }

  private messagingSubscription!: Subscription;
  private profileMessagingSubscription!: Subscription;
  private dataChannelClosingSubscription!: Subscription;

  private get diceMessageStream(): Observable<Envelope<DiceRollMessage>> {
    return this.messagingService.messageStream;
  }

  private get profileMessageStream(): Observable<Envelope<ProfileUpdateMessage>> {
    return this.messagingService.profileMessageStream;
  }

  constructor(
    private messagingService: MessagingService,
    private roomService: RoomService,
    private ref: ChangeDetectorRef,
    private appServiceStore: AppServiceStore
  ) {
    this.refreshTurnOrder();
  }
  readonly title: string = 'Initiative List';

  ngOnInit() {
    this.messagingService.myPeerId.pipe(take(1)).subscribe((peerId: string) => {
      this.initiatives.push({
        displayName: this.appServiceStore.displayName.getValue(),
        peerId: peerId,
        initiativeValue: 0,
        playerCharacterName: 'test',
      });
      this.setupDiceMessageStreamSubscription();
      this.setupProfileMessageStreamSubscription();
      this.setupDataChannelClosingSubscription();
    });
  }

  ngOnDestroy() {
    this.messagingSubscription.unsubscribe();
    this.dataChannelClosingSubscription.unsubscribe();
  }

  onJoinRoom(roomData: RoomData) {}

  leaveRoom() {
    this.roomService.leaveRoom();
  }

  private findInitiativeByPeerId(peerId: string): InitiativeDetail {
    const index = this.initiatives.findIndex((init) => init.peerId === peerId);
    if (index === -1) {
      this.initiatives.push({
        peerId: peerId,
        displayName: this.appServiceStore.displayName.getValue(),
        initiativeValue: 0,
        playerCharacterName: 'test',
      });
      return this.initiatives[this.initiatives.length - 1];
    } else {
      return this.initiatives[index];
    }
  }

  public sendTurnFinishedMessage(): void {
    this.messagingService.sendTurnFinishedMessage();
    this.refreshTurnOrder();
  }

  private setupDiceMessageStreamSubscription(): void {
    this.messagingSubscription = this.messagingService.messageStream.subscribe({
      next: (envelope: Envelope<DiceRollMessage>) => {
        const detail = this.findInitiativeByPeerId(envelope.peerId);

        detail.initiativeValue =
          envelope.message.diceRoll === 0
            ? detail.initiativeValue
            : envelope.message.diceRoll;
        if (envelope.isTurnFinished) {
          const currentPlayersTurn = this.initiatives.splice(0, 1);
          this.initiatives.push(currentPlayersTurn[0]);
          this.initiatives = [...this.initiatives];
        } else {
          this.initiatives = [
            ...this.initiatives.sort((a, b) => b.initiativeValue - a.initiativeValue),
          ];
        }

        //this.ref.detectChanges();
        this.refreshTurnOrder();
      },
    });
  }

  private setupProfileMessageStreamSubscription(): void {
    this.profileMessagingSubscription = this.profileMessageStream.subscribe(
      (profileMessage: Envelope<ProfileUpdateMessage>) => {
        const initItem = this.initiatives.find((x) => x.peerId === profileMessage.peerId);
        if (initItem && initItem.peerId == profileMessage.peerId) {
          initItem.displayName = profileMessage.message.displayName;
          initItem.playerCharacterName = profileMessage.message
            .playerCharacterName as string;
        } else {
          const player: InitiativeDetail = {
            displayName: profileMessage.message.displayName,
            peerId: profileMessage.peerId,
            playerCharacterName: profileMessage.message.playerCharacterName as string,
            initiativeValue: 0,
          };
          this.initiatives = [...this.initiatives, player];
          this.refreshTurnOrder();
        }
      }
    );
  }

  private setupDataChannelClosingSubscription(): void {
    this.dataChannelClosingSubscription =
      this.messagingService.dataChannelClosing$.subscribe({
        next: (peerId: string) => {
          const index = this.initiatives.findIndex(
            (init: InitiativeDetail) => init.peerId === peerId
          );

          if (index > -1) {
            this.initiatives.splice(index, 1);
            this.ref.detectChanges();
          }
        },
      });
  }

  private refreshTurnOrder(): void {
    this.turnFinishedButtonEnabled$ = this.messagingService.myPeerId.pipe(
      map((peerId: string) => {
        return !(peerId === this.initiatives[0].peerId);
      })
    );
  }
}
