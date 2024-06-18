import { ChangeDetectorRef, Component } from '@angular/core';
import { Envelope, MessagingService } from '../messaging.service';
import { AsyncPipe, NgFor } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { Observable, Subscription, map, pipe } from 'rxjs';

type InitiativeDetail = {
  peerId: string;
  displayName: string;
  initiativeValue: number;
};

@Component({
  selector: 'initiative-list',
  standalone: true,
  imports: [NgFor, MatTableModule, AsyncPipe],
  templateUrl: './initiative-list.component.html',
  styleUrl: './initiative-list.component.scss',
})
export class InitiativeListComponent {
  /* Todo: now we need to work out whose turn it is */
  public get turnFinishedButtonEnabled(): Observable<boolean> {
    return this.messagingService.myPeerId.pipe(
      map((peerId: string) => {
        return peerId === this.initiatives[0].peerId;
      })
    );
  }
  public initiatives: InitiativeDetail[] = [];
  public displayedColumns: string[] = ['displayName', 'initiativeValue'];

  private messagingSubscription!: Subscription;
  private dataChannelClosingSubscription!: Subscription;

  constructor(
    private messagingService: MessagingService,
    private ref: ChangeDetectorRef
  ) {}

  ngOnInit() {
    const sub = this.messagingService.myPeerId.subscribe({
      next: (peerId: string) => {
        this.initiatives.push({
          displayName: this.messagingService.displayName,
          peerId: peerId,
          initiativeValue: 0,
        });
        this.setupMessageStreamSubscription();
        this.setupDataChannelClosingSubscription();
        sub.unsubscribe();
      },
    });
  }

  ngOnDestroy() {
    this.messagingSubscription.unsubscribe();
    this.dataChannelClosingSubscription.unsubscribe();
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

  public sendTurnFinishedMessage(): void {
    this.messagingService.sendTurnFinishedMessage();
  }

  private setupMessageStreamSubscription(): void {
    this.messagingSubscription = this.messagingService.messageStream.subscribe({
      next: (envelope: Envelope) => {
        const detail = this.findInitiativeByPeerId(envelope.peerId);

        detail.displayName = envelope.displayName;
        detail.initiativeValue =
          envelope.diceRoll === 0 ? detail.initiativeValue : envelope.diceRoll;
        if (envelope.isTurnFinished) {
          const currentPlayersTurn = this.initiatives.splice(0, 1);
          this.initiatives.push(currentPlayersTurn[0]);
          this.initiatives = [...this.initiatives];
        } else {
          this.initiatives = [
            ...this.initiatives.sort((a, b) => b.initiativeValue - a.initiativeValue),
          ];
        }

        this.ref.detectChanges();
      },
    });
  }

  private setupDataChannelClosingSubscription(): void {
    this.dataChannelClosingSubscription =
      this.messagingService.dataChannelClosing$.subscribe({
        next: (peerId: string) => {
          const index = this.initiatives.findIndex(
            (init: InitiativeDetail) => init.peerId === peerId
          );

          if (index > -1) {
            this.initiatives.splice(index, 1);
            this.ref.detectChanges();
          }
        },
      });
  }
}
