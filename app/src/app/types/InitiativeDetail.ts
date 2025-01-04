import { Observable } from 'rxjs';

export interface HasAuth0Id {
  auth0Id: string;
}

export interface InitiativeDetail extends HasAuth0Id {
  displayName: string;
  playerCharacterName: string | undefined;
  initiativeValue: number;
}
