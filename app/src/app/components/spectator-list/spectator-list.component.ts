import { AsyncPipe } from '@angular/common';
import { ChangeDetectorRef, Component } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { HasAuth0Id } from 'src/app/types/InitiativeDetail';
import { TableListDataSource } from 'src/app/types/TableListDataSource';

@Component({
  selector: 'spectator-list',
  standalone: true,
  imports: [AsyncPipe, MatTableModule],
  templateUrl: './spectator-list.component.html',
  styleUrl: './spectator-list.component.scss',
})
export class SpectatorListComponent {
  public spectatorList!: TableListDataSource<HasAuth0Id>;
  public displayedColumns: string[] = ['displayName', 'initiativeValue'];

  constructor(cdr: ChangeDetectorRef) {
    //this.spectatorList = new TableListDataSource<HasAuth0Id>(cdr);
  }
}
