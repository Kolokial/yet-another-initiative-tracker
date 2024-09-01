import { Observable } from 'rxjs';

export type InitiativeDetail = {
  peerId: string;
  displayName: Observable<string>;
  playerCharacterName: Observable<string>;
  initiativeValue: number;
};
