import { Component } from '@angular/core';
import { MessagingService } from '../messaging.service';

@Component({
  selector: 'initiative-list',
  standalone: true,
  imports: [],
  templateUrl: './initiative-list.component.html',
  styleUrl: './initiative-list.component.scss',
})
export class InitiativeListComponent {
  constructor(private messagingService: MessagingService) {}
}
