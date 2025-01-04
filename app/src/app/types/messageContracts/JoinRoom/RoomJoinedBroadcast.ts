import { Broadcast } from '../Broadcast';
import { Peer } from '../Peer';

export interface RoomJoinedBroadcast extends Broadcast {
  peer: Peer;
}
