import { Broadcast } from '../Broadcast';

export interface CharacteRemovedBroadcast extends Broadcast {
  characterId: number;
}
