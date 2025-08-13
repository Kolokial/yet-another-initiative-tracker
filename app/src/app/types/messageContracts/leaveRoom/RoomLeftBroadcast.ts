import { Broadcast } from '../Broadcast';
import { Peer } from '../Peer';

export interface RoomLeftBroadcast extends Broadcast {
  peer: Peer;
}
