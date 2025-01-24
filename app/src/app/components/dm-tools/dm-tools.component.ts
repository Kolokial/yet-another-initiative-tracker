import { Component } from '@angular/core';
import { InitiativeDetail } from 'src/app/types/InitiativeDetail';

@Component({
  selector: 'dm-tools',
  standalone: true,
  imports: [],
  templateUrl: './dm-tools.component.html',
  styleUrl: './dm-tools.component.scss',
})
export class DmToolsComponent {
  public npcs: InitiativeDetail;
}
