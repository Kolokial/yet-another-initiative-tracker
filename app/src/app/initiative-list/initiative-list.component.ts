import { ChangeDetectorRef, Component, ViewChild } from '@angular/core';
import { Envelope, MessagingService } from '../messaging.service';
import { NgFor } from '@angular/common';
import { MatTable, MatTableModule } from '@angular/material/table';

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
  //public _peers: Map<string, string> = new Map<string, string>();
  public initiatives: InitiativeDetail[] = [];
  public displayedColumns: string[] = ['displayName', 'initiativeValue'];
  @ViewChild(MatTable) public table!: MatTable<InitiativeDetail>;

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
        //this.table.renderRows();
      },
    });

    this.messagingService.messageStream.subscribe((x: Envelope) => {
      if (x.isProfileUpdate) {
        return;
      }
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
