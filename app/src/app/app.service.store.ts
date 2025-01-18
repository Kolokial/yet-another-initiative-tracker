import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Peer } from './types/messageContracts/Peer';
import { PlayerCharacter } from './types/messageContracts/PlayerCharacter';

@Injectable({
  providedIn: 'root',
})
export class AppServiceStore {
  public displayName: BehaviorSubject<string> = new BehaviorSubject('');
  public selectedCharacter = new BehaviorSubject<PlayerCharacter | null>(null);
  public lastSentRoll: number = 0;
  public lastDiceRoll: number = 0;
  public peerList = new BehaviorSubject<Peer[]>([]);
  public isSpectator: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  constructor() {}
}
