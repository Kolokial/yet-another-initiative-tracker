import { Broadcast } from '../Broadcast';

export interface CharacterInPlayUpdatedBroadcast extends Broadcast {
  characterName: string;
}
