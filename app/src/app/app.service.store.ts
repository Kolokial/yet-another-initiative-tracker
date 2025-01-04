import { Injectable } from '@angular/core';
import { PlayerCharacter } from './types/api/PlayerCharacter';
import { BehaviorSubject } from 'rxjs';
import { InitiativeDetail } from './types/InitiativeDetail';
import { TableListDataSource } from './types/TableListDataSource';

@Injectable({
  providedIn: 'root',
})
export class AppServiceStore {
  public displayName: BehaviorSubject<string> = new BehaviorSubject('');
  public selectedCharacter = new BehaviorSubject<PlayerCharacter | null>(null);
  public lastSentRoll: number = 0;
  public initativeList = new BehaviorSubject<InitiativeDetail[]>([]);
  public isSpectator: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  constructor() {}
}
