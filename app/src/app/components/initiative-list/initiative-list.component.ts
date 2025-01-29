import { ChangeDetectorRef, Component, inject, Input, ViewChild } from '@angular/core';
import { AsyncPipe, CommonModule } from '@angular/common';
import { MatTable, MatTableModule } from '@angular/material/table';
import { Observable } from 'rxjs';
import { HasTitle } from '../../types/Title';
import { AppServiceStore } from 'src/app/app.service.store';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { InitiativeDetail } from 'src/app/types/InitiativeDetail';
import { TableListDataSource } from '../../types/TableListDataSource';
import { SignalRService } from 'src/app/shared-services/signal-r.service';
import { Peer } from 'src/app/types/messageContracts/Peer';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { InitiativeTrackerComponent } from '../initiative-tracker/initiative-tracker.component';
import { Character } from 'src/app/types/messageContracts/Character';

@Component({
  selector: 'initiative-list',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    AsyncPipe,
    MatIconModule,
    MatButtonModule,
    MatInputModule,
    MatDialogModule,
  ],
  templateUrl: './initiative-list.component.html',
  styleUrl: './initiative-list.component.scss',
})
export class InitiativeListComponent implements HasTitle {
  @Input()
  public set isDungeonMaster(value: boolean) {
    this._isDungeonMaster = value;
    if (value) {
      this.displayedColumns.unshift('rollDice');
      this.displayedColumns.push('endTurn');
    }
  }

  public get isDungeonMaster(): boolean {
    return this._isDungeonMaster;
  }
  private _isDungeonMaster: boolean = false;

  private readonly dialog = inject(MatDialog);

  /* Todo: now we need to work out whose turn it is */
  public turnFinishedButtonEnabled$!: Observable<boolean>;
  public initiatives!: TableListDataSource<Character>;
  //public initiatives: Peer[] = [];
  public spectators!: TableListDataSource<InitiativeDetail>;
  public displayedColumns: string[] = ['displayName', 'initiativeValue'];

  public get selectedCharacter() {
    return this._appServiceStore.selectedCharacter.value[0];
  }

  public get auth0Id(): string {
    return this._appServiceStore.auth0Id;
  }

  @ViewChild(MatTable) table!: MatTable<Peer[]>;

  constructor(
    private _ref: ChangeDetectorRef,
    private _appServiceStore: AppServiceStore,
    private _signalR: SignalRService
  ) {
    this.initiatives = new TableListDataSource(this._ref);
    //this.spectators = new TableListDataSource(this._ref);
  }
  readonly title: string = 'Initiative List';

  ngOnInit() {
    this.initiatives.setDataStream(this._appServiceStore.charactersInRoom);
  }

  sendTurnFinishedMessage(): void {
    this._signalR.finishTurn().subscribe((x) => console.log('ending turn'));
  }

  openInitiativeTracker(): void {
    const dialogRef = this.dialog.open(InitiativeTrackerComponent);

    dialogRef.afterClosed().subscribe((result) => {
      console.log(`Dialog result: ${result}`);
    });
  }
}
