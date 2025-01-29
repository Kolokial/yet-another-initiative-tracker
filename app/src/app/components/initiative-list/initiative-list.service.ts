import { Observable, Subscription } from 'rxjs';
import { AppServiceStore } from 'src/app/app.service.store';
import { SignalRService } from 'src/app/shared-services/signal-r.service';
import { Character } from 'src/app/types/messageContracts/Character';
import { Peer } from 'src/app/types/messageContracts/Peer';
import { CharacteRemovedBroadcast as CharacterRemovedBroadcast } from 'src/app/types/messageContracts/removeCharacter/CharacterRemovedBroadcast';
import { UpdateDisplayNameBroadcast } from 'src/app/types/messageContracts/updateDisplayName/DisplayNameUpdatedBroadcast';

export class InitiativeListService {
  private _subscriptions: Subscription[] = [];
  private _peers: Peer[] = [];
  private _characters: Character[] = [];

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
    this.setupOnCharacterAddedSubscription();
    this.setupOnCharacterRemovedSubscription();

    this._appStore.peerList.subscribe((peers) => {
      this._peers = peers;
    });

    this._appStore.charactersInRoom.subscribe((characters) => {
      this._characters = characters;
    });
  }

  private setupOnRoomJoinedSubscription(): void {
    this._subscriptions.push(
      this._signalR.onRoomJoined$.subscribe((peer: Peer) => {
        if (this._peers.findIndex((x) => x.auth0Id === peer.auth0Id) === -1) {
          this._peers.push(peer);
        }

        this._appStore.peerList.next(this._peers);

        if (peer.characters && peer.characters.length) {
          if (this._characters.length) {
            const peerCharacters = peer.characters.filter(
              (pc) => !this._characters.some((c) => c.id === pc.id)
            );
            this._characters.push(...peerCharacters);
          } else {
            this._characters.push(...peer.characters);
          }
          this._appStore.charactersInRoom.next(this._characters);
        }
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

        this._appStore.peerList.next(this._peers);

        if (peer.characters && peer.characters.length) {
          const characterIndexes = peer.characters.map((char) => {
            return this._characters.findIndex((pchar) => char.id === pchar.id);
          });

          characterIndexes.forEach((ci) => {
            if (ci !== -1) {
              this._characters.splice(ci, 1);
            }
          });
          this._appStore.charactersInRoom.next(this._characters);
        }
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
      this._signalR.onDiceRolled$.subscribe((broadcast) => {
        var index = this._characters.findIndex(
          (c) => c.auth0Id === broadcast.auth0Id && c.id === broadcast.characterId
        );
        if (index === -1) {
          return;
        }

        this._characters[index].initiative = broadcast.diceRoll;
        this._appStore.charactersInRoom.next(this._characters);
      })
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
    this._subscriptions.push(
      this._signalR.onCharacterInPlayUpdated$.subscribe((broadcast) => {
        var index = this._characters.findIndex(
          (c) => c.auth0Id === broadcast.auth0Id && c.id === broadcast.character.id
        );
        if (index === -1) {
          return;
        }

        this._characters[index] = broadcast.character;
        this._appStore.charactersInRoom.next(this._characters);
      })
    );
  }

  private setupOnCharacterAddedSubscription(): void {
    this._subscriptions.push(
      this._signalR.onCharacterAdded$.subscribe((character: Character) => {
        const characterIndex = this._characters.findIndex((c) => c.id == character.id);

        if (characterIndex === -1) {
          this._characters.push(character);
          this._appStore.charactersInRoom.next(this._characters);
        }
      })
    );
  }

  private setupOnCharacterRemovedSubscription(): void {
    this._subscriptions.push(
      this._signalR.onCharacterRemoved$.subscribe(
        (character: CharacterRemovedBroadcast) => {
          const characterIndex = this._characters.findIndex(
            (c) => c.id == character.characterId
          );

          if (characterIndex !== -1) {
            this._characters.splice(characterIndex, 1);
            this._appStore.charactersInRoom.next(this._characters);
          }
        }
      )
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
