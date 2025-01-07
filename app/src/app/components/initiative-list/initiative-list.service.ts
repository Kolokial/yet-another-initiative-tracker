import { Injectable } from '@angular/core';
import { Subscription } from 'rxjs';
import { AppServiceStore } from 'src/app/app.service.store';
import { SignalRService } from 'src/app/shared-services/signal-r.service';
import { Peer } from 'src/app/types/messageContracts/Peer';

export class InitiativeListService {
  private _subscriptions: Subscription[] = [];
  private _peers: Peer[] = [];

  constructor(
    private _signalR: SignalRService,
    private _appStore: AppServiceStore
  ) {
    this.setupOnDiceRolledSubscription();
    this.setupOnRoomJoinedSubscription();
    this.setupOnRoomLeftSubscription();
    this.setupOnTurnFinishedSubscription();
    this.setupOnDisplayNameUpdatedSubscription();

    this._appStore.peerList.subscribe((peers) => {
      this._peers = peers;
    });
  }

  private setupOnRoomJoinedSubscription(): void {
    this._subscriptions.push(
      this._signalR.onRoomJoined$.subscribe((peer: Peer) => {
        if (this._peers.findIndex((x) => x.auth0Id === peer.auth0Id) === -1) {
          this._peers.push(peer);
        }

        this._peers.sort((a: Peer, b: Peer) => {
          return a.diceRoll > b.diceRoll ? 0 : 1;
        });

        this._appStore.peerList.next(this._peers);
      })
    );
  }

  private setupOnRoomLeftSubscription(): void {
    this._subscriptions.push(
      this._signalR.onRoomLeft$.subscribe((auth0Id: string) => {
        const index = this._peers.findIndex((x) => x.auth0Id === auth0Id);
        if (index === -1) {
          return;
        }
        this._peers.splice(index, 1);

        this._peers.sort((a: Peer, b: Peer) => {
          return a.diceRoll > b.diceRoll ? 0 : 1;
        });
        this._appStore.peerList.next(this._peers);
      })
    );
  }

  private setupOnTurnFinishedSubscription(): void {
    this._subscriptions.push(
      this._signalR.onTurnFinished$.subscribe((x) => {
        console.log(x);
        this._appStore.peerList.next(this._peers);
      })
    );
  }

  private setupOnDiceRolledSubscription(): void {
    this._subscriptions.push(
      this._signalR.onDiceRolled$.subscribe((x) => {
        //this.initiatives.
        const index = this._peers.findIndex((p) => p.auth0Id === x.auth0Id);
        if (index === -1) {
          return;
        }

        this._peers[index].diceRoll = x.diceRoll;

        this._appStore.peerList.next(this._peers);
      })
    );
  }

  private setupOnDisplayNameUpdatedSubscription(): void {
    this._subscriptions.push(
      this._signalR.onDisplayNameUpdated$.subscribe((x) => {
        const index = this._peers.findIndex((p) => p.auth0Id === x.auth0Id);
        if (index === -1) {
          return;
        }

        this._peers[index].displayName = x.displayName;

        this._appStore.peerList.next(this._peers);
      })
    );
  }
}
