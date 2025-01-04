import { ChangeDetectorRef, Component, Input } from '@angular/core';
import { AsyncPipe, CommonModule, NgFor } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { Observable, Subscription } from 'rxjs';
import { HasTitle } from '../../types/Title';
import { AppServiceStore } from 'src/app/app.service.store';
import { RoomComponent } from '../room/room.component';
import { RoomService } from '../room/room.service';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { InitiativeDetail } from 'src/app/types/InitiativeDetail';
import { TableListDataSource } from '../../types/TableListDataSource';
import { SpectatorListComponent } from '../spectator-list/spectator-list.component';
import { SignalRService } from 'src/app/shared-services/signal-r.service';
import { Peer } from 'src/app/types/messageContracts/Peer';
import { Envelope } from 'src/app/types/messageContracts/Envelope';

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

  private _peerList: Peer[] | null = [];
  @Input()
  public set peerList(p: Peer[] | null) {
    this._peerList = this.peerList;
    if (p && p.length) {
      this.peerListUpdated(p);
    }
  }

  public get peerList(): Peer[] | null {
    return this._peerList;
  }

  private onPeerJoinedSubscription: Subscription | undefined;
  private onPeerLeftSubscription: Subscription | undefined;

  constructor(
    private roomService: RoomService,
    private ref: ChangeDetectorRef,
    private _appServiceStore: AppServiceStore,
    private signalR: SignalRService
  ) {
    this.initiatives = new TableListDataSource(this.ref);
    this.spectators = new TableListDataSource(this.ref);
  }
  readonly title: string = 'Initiative List';

  ngOnInit() {
    this.setupInitialIniativeList();
    this.setupOnPeerJoinedSubscription();
    this.setupOnPeerLeftSubscription();
  }

  ngOnDestroy() {
    this.unsubscribe();
  }

  peerListUpdated(peerList: Peer[]) {
    this.initiatives = new TableListDataSource(this.ref);
    this.initiatives.setRows(
      peerList.map((x) => {
        return {
          displayName: x.displayName,
          initiativeValue: x.diceRoll,
          playerCharacterName: x.characterName,
          auth0Id: x.auth0Id,
        } as InitiativeDetail;
      })
    );
    console.log(this.initiatives.getRows());
  }

  leaveRoom() {
    this.roomService.leaveRoom();
    this.unsubscribe();
  }

  private setupOnPeerJoinedSubscription(): void {
    this.onPeerJoinedSubscription = this.signalR.onPeerJoined$.subscribe((peer: Peer) => {
      this.initiatives.addRow({
        displayName: peer.displayName,
        initiativeValue: peer.diceRoll,
        auth0Id: peer.auth0Id,
        playerCharacterName: peer.characterName,
      });
    });
  }
  private setupOnPeerLeftSubscription(): void {
    this.onPeerLeftSubscription = this.signalR.onPeerLeft$.subscribe(
      (auth0Id: string) => {
        this.initiatives.deleteRow(auth0Id);
      }
    );
  }

  private setupInitialIniativeList(): void {
    if (!this._appServiceStore.initativeList) {
      this.initiatives = new TableListDataSource(this.ref);
    }
  }

  private unsubscribe() {
    this.onPeerJoinedSubscription?.unsubscribe();
    this.onPeerLeftSubscription?.unsubscribe();
  }

  public sendTurnFinishedMessage(): void {
    this.signalR.finishTurn().subscribe((x) => console.log('ending turn'));
  }
}
