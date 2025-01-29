import { Character } from '../Character';

export interface JoinRoomRequest {
  roomName: string;
  displayName: string;
  characters?: Character[];
  isDungeonMaster: boolean;
}
