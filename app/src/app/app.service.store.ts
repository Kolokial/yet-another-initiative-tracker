import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Peer } from './types/messageContracts/Peer';
import { Character } from './types/messageContracts/Character';
import { PlayerCharacter } from '@shared-types/api/PlayerCharacter';

@Injectable({
  providedIn: 'root',
})
export class AppServiceStore {
  public auth0Id: string = '';
  public displayName: BehaviorSubject<string> = new BehaviorSubject('');
  public selectedCharacter = new BehaviorSubject<PlayerCharacter[]>([]);
  public lastSentRoll: number = 0;
  public lastDiceRoll: number = 0;
  public peerList = new BehaviorSubject<Peer[]>([]);
  public charactersInRoom = new BehaviorSubject<Character[]>([]);
  public isSpectator: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  constructor() {}

  public convertPlayerCharacterToCharacter(): Character[] {
    return this.selectedCharacter.value.map((character) => {
      return {
        alertFeat: character.alertFeat,
        auth0Id: this.auth0Id,
        dexterityMod: character.dexterityMod,
        id: character.playerCharacterId,
        initiative: 0,
        luckStone: character.luckStone,
        name: character.characterName,
      };
    });
  }
}
