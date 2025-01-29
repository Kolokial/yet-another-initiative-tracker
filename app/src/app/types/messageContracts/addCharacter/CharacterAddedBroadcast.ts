import { Broadcast } from '../Broadcast';
import { Character } from '../Character';

export interface CharacterAddedBroadcast extends Broadcast {
  character: Character;
}
