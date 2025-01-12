import { Broadcast } from '../Broadcast';

export interface UpdateDisplayNameBroadcast extends Broadcast {
  displayName: string;
}
