import { Broadcast } from '../Broadcast';

export interface DiceRolledBroadcast extends Broadcast {
  diceRoll: number;
}
