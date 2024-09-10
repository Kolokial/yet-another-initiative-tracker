import { ChangeDetectorRef, Component } from '@angular/core';
import { MessagingService } from '../../shared-services/messaging.service';
import { AsyncPipe, CommonModule, NgFor } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import {
  BehaviorSubject,
  Observable,
  Subscription,
  combineLatestWith,
  map,
  of,
  tap,
} from 'rxjs';
import { HasTitle } from '../../types/title';
import { AppServiceStore } from 'src/app/app.service.store';
import {
  Envelope,
  DiceRollMessage,
  ProfileUpdateMessage,
  PeerId,
} from 'src/app/types/messages';
import { RoomComponent } from '../room/room.component';
import { RoomData } from 'src/app/types/roomInfo';
import { RoomService } from '../room/room.service';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { DataSource } from '@angular/cdk/collections';
import { HasPeerId, InitiativeDetail } from 'src/app/types/InitiativeDetail';
import { DataChannelInboundEvents } from 'src/app/types/dataChannels';

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
  public initiatives!: TableListDataSource<InitiativeDetail>;
  public spectators!: TableListDataSource<HasPeerId>;
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

  private diceMessagingSubscriptions: { [peerId: string]: Subscription } = {};
  private profileMessagingSubscriptions: { [peerId: string]: Subscription } = {};
  private dataChannelClosingSubscriptions: { [peerId: string]: Subscription } = {};

  constructor(
    private messagingService: MessagingService,
    private roomService: RoomService,
    private ref: ChangeDetectorRef,
    private appServiceStore: AppServiceStore
  ) {
    this.initiatives = new TableListDataSource(this.ref);
  }
  readonly title: string = 'Initiative List';

  ngOnInit() {
    this.messagingService.myPeerId.subscribe((peerId: string) => {
      if (!peerId) {
        this.initiatives.setRows([]);
      } else {
        this.setupInitialIniativeList(peerId);
      }
    });

    this.roomService.onDataChannelAdded$.subscribe((dataChannelEventsCollection) => {
      this.addMessageStreamSubscription(dataChannelEventsCollection.PeerId);
    });
  }

  ngOnDestroy() {
    this.appServiceStore.initativeList = this.initiatives.getRows();
    this.unsubscribe();
  }

  onJoinRoom(roomData: RoomData) {}

  leaveRoom() {
    this.roomService.leaveRoom();
    this.appServiceStore.initativeList = [];
    this.unsubscribe();
  }

  private setupInitialIniativeList(peerId: string): void {
    this.initiatives = new TableListDataSource(this.ref);
    this.initiatives.setRows(this.appServiceStore.initativeList);
    const initiatives = this.initiatives.getRows();
    const index = initiatives.findIndex((init) => init.peerId === peerId);

    if (index == -1) {
      initiatives.push({
        displayName: this.appServiceStore.displayName.pipe(
          tap((x) => console.log('tapping displayName'))
        ),
        peerId: peerId,
        initiativeValue: this.appServiceStore.lastSentRoll,
        playerCharacterName: this.appServiceStore.selectedCharacter.pipe(
          tap((x) => {
            console.log('oof', x);
          }),
          map((x) => x!.CharacterName as string)
        ),
      });
    } else {
      initiatives[index].initiativeValue = this.appServiceStore.lastSentRoll;
    }

    this.setupMessageStreamsSubscriptions();

    this.initiatives.setRows(initiatives);
  }

  private setupMessageStreamsSubscriptions(): void {
    Object.keys(this.roomService.dataChannelCollections).forEach((peerId) => {
      this.addMessageStreamSubscription(peerId);
    });
  }

  private addMessageStreamSubscription(peerId: string): void {
    const profileChannel = this.roomService.dataChannelCollections[peerId].ProfileChannel;
    const diceChannel = this.roomService.dataChannelCollections[peerId].DiceChannel;
    this.setupProfileOnMessageSubscription(profileChannel.InboundEvents, peerId);
    this.setupDiceOnMessageSubscription(diceChannel.InboundEvents, peerId);
    this.setupDataChannelOnClosingSubscription(
      profileChannel.InboundEvents.onClose,
      peerId
    );
    this.setupDataChannelOnClosingSubscription(diceChannel.InboundEvents.onClose, peerId);
  }

  private unsubscribe() {
    Object.values(this.diceMessagingSubscriptions).forEach((subscription) =>
      subscription.unsubscribe()
    );
    Object.values(this.profileMessagingSubscriptions).forEach((subscription) =>
      subscription.unsubscribe()
    );
    Object.values(this.dataChannelClosingSubscriptions).forEach((subscription) =>
      subscription.unsubscribe()
    );
  }

  private findInitiativeByPeerId(
    peerId: string,
    initiatives: InitiativeDetail[]
  ): InitiativeDetail {
    const index = initiatives.findIndex((init) => init.peerId === peerId);
    if (index === -1) {
      initiatives.push({
        peerId: peerId,
        displayName: this.appServiceStore.displayName,
        initiativeValue: 0,
        playerCharacterName: this.appServiceStore.selectedCharacter.pipe(
          map((x) => x!.CharacterName)
        ),
      });
      return initiatives[initiatives.length - 1];
    } else {
      return initiatives[index];
    }
  }

  public sendTurnFinishedMessage(): void {
    this.messagingService.sendTurnFinishedMessage();
  }

  private setupDiceOnMessageSubscription(
    diceChannel: DataChannelInboundEvents<DiceRollMessage>,
    peerId: string
  ): void {
    this.diceMessagingSubscriptions[peerId] = diceChannel.onMessage.subscribe({
      next: (envelope: Envelope<DiceRollMessage>) => {
        const initiatives = this.initiatives.getRows();
        const detail = this.findInitiativeByPeerId(envelope.peerId, initiatives);

        detail.initiativeValue =
          envelope.message.diceRoll === 0
            ? detail.initiativeValue
            : envelope.message.diceRoll;
        if (envelope.isTurnFinished) {
          const currentPlayersTurn = initiatives.splice(0, 1);
          this.initiatives.addRow(currentPlayersTurn[0]);
        } else {
          this.initiatives.setRows(
            initiatives.sort((a, b) => b.initiativeValue - a.initiativeValue)
          );
        }
      },
    });
  }

  private setupProfileOnMessageSubscription(
    profileChannel: DataChannelInboundEvents<ProfileUpdateMessage>,
    peerId: string
  ): void {
    this.profileMessagingSubscriptions[peerId] = profileChannel.onMessage.subscribe(
      (profileMessage: Envelope<ProfileUpdateMessage>) => {
        const initiatives = this.initiatives.getRows();
        const initItem = initiatives.find((x) => x.peerId === profileMessage.peerId);
        if (initItem && initItem.peerId == profileMessage.peerId) {
          initItem.displayName = of(profileMessage.message.displayName);
          initItem.playerCharacterName = of(
            profileMessage.message.playerCharacterName as string
          );
          this.ref.markForCheck();
        } else {
          const player: InitiativeDetail = {
            displayName: of(profileMessage.message.displayName),
            peerId: profileMessage.peerId,
            playerCharacterName: of(profileMessage.message.playerCharacterName as string),
            initiativeValue: 0,
          };
          this.initiatives.addRow(player);
        }
      }
    );
  }

  private setupDataChannelOnClosingSubscription(
    onClose$: Observable<PeerId>,
    peerId: string
  ): void {
    this.dataChannelClosingSubscriptions[peerId] = onClose$.subscribe({
      next: (peerId: string) => {
        this.initiatives.deleteRow(peerId);
      },
    });
  }
}

class TableListDataSource<T extends HasPeerId> extends DataSource<T> {
  constructor(private cdr: ChangeDetectorRef) {
    super();
  }
  private _dataStream = new BehaviorSubject<T[]>([]);

  override connect(): Observable<readonly T[]> {
    return this._dataStream.asObservable();
  }

  override disconnect(): void {
    this._dataStream.complete();
  }

  public setRows(initiativeDetail: T[]): void {
    this._dataStream.next(initiativeDetail);
    this.cdr.markForCheck();
  }

  public addRow(initiativeDetail: T): void {
    const initiaves = this._dataStream.getValue();
    this._dataStream.next([...initiaves, initiativeDetail]);
    this.cdr.markForCheck();
  }

  public deleteRow(peerId: string): void {
    const initiatives = this._dataStream.getValue();
    this._dataStream.next(
      initiatives.filter((initDetail) => initDetail.peerId !== peerId)
    );
    this.cdr.markForCheck();
  }

  public getRows(): T[] {
    return this._dataStream.getValue();
  }
}
