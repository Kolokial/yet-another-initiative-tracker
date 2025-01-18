import { Broadcast } from '../Broadcast';

export interface InitiativeUpdatedBroadcast extends Broadcast {
  initiative: number;
}
