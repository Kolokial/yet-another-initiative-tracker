import { Observable, Subscription } from 'rxjs';
import { AppServiceStore } from 'src/app/app.service.store';
import { SignalRService } from 'src/app/shared-services/signal-r.service';
import { Peer } from 'src/app/types/messageContracts/Peer';
import { DiceRolledBroadcast } from 'src/app/types/messageContracts/rollDice/DiceRolledBroadcast';
import { CharacterInPlayUpdatedBroadcast } from 'src/app/types/messageContracts/updateCharacterInPlay/CharacterInPlayUpdatedBroadcast';
import { UpdateDisplayNameBroadcast } from 'src/app/types/messageContracts/updateDisplayName/DisplayNameUpdatedBroadcast';

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
    this.setupOnCharacterInPlayUpdatedSubscription();

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
      this._signalR.onRoomLeft$.subscribe((peer: Peer) => {
        const index = this._peers.findIndex((x) => x.auth0Id === peer.auth0Id);
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
    this.setupGenericUpdatePeerListItemSubscription(
      this._signalR.onDiceRolled$,
      (diceRoll: DiceRolledBroadcast) => diceRoll.auth0Id,
      (peer: Peer, diceRoll: DiceRolledBroadcast) => {
        peer.diceRoll = diceRoll.diceRoll;
        return peer;
      }
    );
  }

  private setupOnDisplayNameUpdatedSubscription(): void {
    this.setupGenericUpdatePeerListItemSubscription(
      this._signalR.onDisplayNameUpdated$,
      (displayName: UpdateDisplayNameBroadcast) => displayName.auth0Id,
      (peer: Peer, displayName: UpdateDisplayNameBroadcast) => {
        peer.displayName = displayName.displayName;
        return peer;
      }
    );
  }

  private setupOnCharacterInPlayUpdatedSubscription(): void {
    this.setupGenericUpdatePeerListItemSubscription(
      this._signalR.onCharacterInPlayUpdated$,
      (char: CharacterInPlayUpdatedBroadcast) => char.auth0Id,
      (peer: Peer, char: CharacterInPlayUpdatedBroadcast) => {
        peer.characterName = char.characterName;
        return peer;
      }
    );
  }

  private setupGenericUpdatePeerListItemSubscription<T>(
    observable: Observable<T>,
    getAuthId: (emittedResult: T) => string,
    updatePeer: (peer: Peer, emittedResult: T) => Peer
  ): void {
    this._subscriptions.push(
      observable.subscribe((emittedResult) => {
        const index = this._peers.findIndex(
          (p) => p.auth0Id === getAuthId(emittedResult)
        );
        if (index === -1) {
          return;
        }

        this._peers[index] = updatePeer(this._peers[index], emittedResult);

        this._appStore.peerList.next(this._peers);
      })
    );
  }
}
