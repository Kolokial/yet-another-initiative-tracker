import { Broadcast } from '../Broadcast';
import { Character } from '../Character';

export interface CharacterInPlayUpdatedBroadcast extends Broadcast {
  character: Character;
}
