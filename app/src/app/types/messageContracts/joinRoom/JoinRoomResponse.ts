import { Peer } from '../Peer';
import { ResponseBase } from '../ResponseBase';

export interface JoinRoomResponse extends ResponseBase {
  peerList: Peer[];
  isRoomJoined: boolean;
}
