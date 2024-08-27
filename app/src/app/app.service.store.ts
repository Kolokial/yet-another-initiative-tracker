import { Injectable } from '@angular/core';
import { PlayerCharacter } from '@shared-types/api/PlayerCharacter';
import { BehaviorSubject, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AppServiceStore {
  public displayName: BehaviorSubject<string> = new BehaviorSubject('');
  public selectedCharacter = new BehaviorSubject<PlayerCharacter | null>(null);

  constructor() {}
}
