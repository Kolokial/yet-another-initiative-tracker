export interface JoinRoomRequest {
  roomName: string;
  displayName: string;
  diceRoll: number;
  characterName?: string;
  isDungeonMaster: boolean;
}
