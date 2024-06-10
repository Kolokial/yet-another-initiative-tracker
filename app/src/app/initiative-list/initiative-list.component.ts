import { Component } from '@angular/core';
import { Envelope, MessagingService } from '../messaging.service';
import { NgFor } from '@angular/common';

@Component({
  selector: 'initiative-list',
  standalone: true,
  imports: [NgFor],
  templateUrl: './initiative-list.component.html',
  styleUrl: './initiative-list.component.scss',
})
export class InitiativeListComponent {
  private _peers: Map<string, string> = new Map<string, string>();

  public get peerList(): string[] {
    return Object.values(this._peers);
  }

  constructor(private messagingService: MessagingService) {}

  ngOnInit() {
    this.messagingService.messageStream.subscribe({
      next: (envelope: Envelope) => {
        if (envelope.isProfileUpdate) {
          this._peers.set(envelope.peerId, envelope.displayName);
        }
      },
    });
  }
}
