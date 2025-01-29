import { Broadcast } from '../Broadcast';

export interface DiceRolledBroadcast extends Broadcast {
  characterId: number;
  diceRoll: number;
}
