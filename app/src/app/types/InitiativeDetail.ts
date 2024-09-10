import { Observable } from 'rxjs';

export interface HasPeerId {
  peerId: string;
}

export interface InitiativeDetail extends HasPeerId {
  displayName: Observable<string>;
  playerCharacterName: Observable<string>;
  initiativeValue: number;
}
