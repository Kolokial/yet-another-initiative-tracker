import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { SignalRService } from 'src/app/shared-services/signal-r.service';
import { InitiativeDetail } from 'src/app/types/InitiativeDetail';

@Component({
  selector: 'dm-tools',
  standalone: true,
  imports: [MatIconModule, MatButtonModule],
  templateUrl: './dm-tools.component.html',
  styleUrl: './dm-tools.component.scss',
})
export class DmToolsComponent {
  constructor(private _signalR: SignalRService) {}

  onClickSortInitiative(): void {
    this._signalR.sortInitiativeList();
  }
}
