import { ChangeDetectorRef, Component, Signal } from '@angular/core';
import { MessagingService } from '../../shared-services/messaging.service';
import { AsyncPipe, CommonModule, NgFor } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { Observable, Subscription, combineLatestWith, map, of, tap } from 'rxjs';
import { HasTitle } from '../../types/Title';
import { AppServiceStore } from 'src/app/app.service.store';
import {
  Envelope,
  DiceRollMessage,
  ProfileUpdateMessage,
  PeerId,
  Peer,
} from 'src/app/types/Messages';
import { RoomComponent } from '../room/room.component';
import { RoomData } from 'src/app/types/RoomInfo';
import { RoomService } from '../room/room.service';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { HasPeerId, InitiativeDetail } from 'src/app/types/InitiativeDetail';
import { TableListDataSource } from '../../types/TableListDataSource';
import { SpectatorListComponent } from '../spectator-list/spectator-list.component';
import { DataChannelInboundEvents } from 'src/app/types/DataChannels';
import { SignalRService } from 'src/app/shared-services/signal-r.service';

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
    SpectatorListComponent,
  ],
  templateUrl: './initiative-list.component.html',
  styleUrl: './initiative-list.component.scss',
})
export class InitiativeListComponent implements HasTitle {
  /* Todo: now we need to work out whose turn it is */
  public turnFinishedButtonEnabled$!: Observable<boolean>;
  public initiatives!: TableListDataSource<InitiativeDetail>;
  public spectators!: TableListDataSource<InitiativeDetail>;
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

  private onPeerJoinedSubscription: Subscription | undefined;

  constructor(
    private messagingService: MessagingService,
    private roomService: RoomService,
    private ref: ChangeDetectorRef,
    private appServiceStore: AppServiceStore,
    private signalR: SignalRService
  ) {
    this.initiatives = new TableListDataSource(this.ref);
    this.spectators = new TableListDataSource(this.ref);
  }
  readonly title: string = 'Initiative List';

  ngOnInit() {
    this.onPeerJoinedSubscription = this.signalR.onPeerJoined$.subscribe((peer: Peer) => {
      if (!peer) {
        this.initiatives.setRows([]);
      } else {
        this.setupInitialIniativeList(peer);
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

  onJoinRoom(peerList: Peer[]) {
    this.initiatives.setRows(
      peerList.map((x) => {
        return {
          displayName: of(x.displayName),
          initiativeValue: x.diceRoll,
          playerCharacterName: of(x.characterName),
        } as InitiativeDetail;
      })
    );
  }

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
          map((x) => x!.characterName as string)
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
  }

  private unsubscribe() {
    this.onPeerJoinedSubscription?.unsubscribe();
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
          map((x) => x!.characterName)
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
  ): void {}

  private setupProfileOnMessageSubscription(
    profileChannel: DataChannelInboundEvents<ProfileUpdateMessage>,
    peerId: string
  ): void {}

  private populateTableListDataSource<T>(
    dataSource: TableListDataSource<InitiativeDetail>,
    envelope: Envelope<ProfileUpdateMessage>
  ): void {
    const dataSourceRows = dataSource.getRows();
    const initItem = dataSourceRows.find((x) => x.peerId === envelope.auth0Id);
    if (initItem && initItem.peerId == envelope.auth0Id) {
      initItem.displayName = of(envelope.message.displayName);
      initItem.playerCharacterName = of(envelope.message.playerCharacterName as string);
      this.ref.markForCheck();
    } else {
      const player: InitiativeDetail = {
        displayName: of(envelope.message.displayName),
        peerId: envelope.auth0Id,
        playerCharacterName: of(envelope.message.playerCharacterName as string),
        initiativeValue: 0,
      };
      dataSource.addRow(player);
    }
  }
}
