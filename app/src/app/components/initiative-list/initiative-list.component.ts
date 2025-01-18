import { ChangeDetectorRef, Component, Input, ViewChild } from '@angular/core';
import { AsyncPipe, CommonModule, NgFor } from '@angular/common';
import { MatTable, MatTableModule } from '@angular/material/table';
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
  public initiatives!: TableListDataSource<Peer>;
  //public initiatives: Peer[] = [];
  public spectators!: TableListDataSource<InitiativeDetail>;
  public displayedColumns: string[] = ['displayName', 'initiativeValue'];

  @ViewChild(MatTable) table!: MatTable<Peer[]>;

  constructor(
    private _roomService: RoomService,
    private _ref: ChangeDetectorRef,
    private _appServiceStore: AppServiceStore,
    private _signalR: SignalRService
  ) {
    this.initiatives = new TableListDataSource(this._ref);
    //this.spectators = new TableListDataSource(this._ref);
  }
  readonly title: string = 'Initiative List';

  ngOnInit() {
    this.initiatives.setDataStream(this._appServiceStore.peerList);
  }

  leaveRoom() {
    this._roomService.leaveRoom();
  }

  sendTurnFinishedMessage(): void {
    this._signalR.finishTurn().subscribe((x) => console.log('ending turn'));
  }
}
