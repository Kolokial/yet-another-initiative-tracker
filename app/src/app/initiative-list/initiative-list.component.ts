import { ChangeDetectorRef, Component } from '@angular/core';
import { Envelope, MessagingService } from '../messaging.service';
import { NgFor } from '@angular/common';
import { MatTableModule } from '@angular/material/table';

type InitiativeDetail = {
  peerId: string;
  displayName: string;
  initiativeValue: number;
};

@Component({
  selector: 'initiative-list',
  standalone: true,
  imports: [NgFor, MatTableModule],
  templateUrl: './initiative-list.component.html',
  styleUrl: './initiative-list.component.scss',
})
export class InitiativeListComponent {
  /* Todo: now we need to work out whose turn it is */
  public initiatives: InitiativeDetail[] = [];
  public displayedColumns: string[] = ['displayName', 'initiativeValue'];

  constructor(
    private messagingService: MessagingService,
    private ref: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.initiatives.push({
      displayName: this.messagingService.displayName,
      peerId: this.messagingService.myPeerId,
      initiativeValue: 0,
    });

    this.messagingService.messageStream.subscribe({
      next: (envelope: Envelope) => {
        const detail = this.findInitiativeByPeerId(envelope.peerId);

        detail.displayName = envelope.displayName;
        detail.initiativeValue = parseInt(envelope.message);
        this.initiatives = [
          ...this.initiatives.sort((a, b) => b.initiativeValue - a.initiativeValue),
        ];
        this.ref.detectChanges();
      },
    });
  }

  private findInitiativeByPeerId(peerId: string): InitiativeDetail {
    const index = this.initiatives.findIndex((init) => init.peerId === peerId);
    if (index === -1) {
      this.initiatives.push({
        peerId: peerId,
        displayName: '',
        initiativeValue: 0,
      });
      return this.initiatives[this.initiatives.length - 1];
    } else {
      return this.initiatives[index];
    }
  }
}
