// export type Envelope<T> = {
//   auth0Id: string;
//   dateStamp: Date;
//   message: T;
// };

// export type Broadcast = {
//   auth0Id: string;
// };

// export type ProfileUpdateMessage = {
//   displayName: string;
//   playerCharacterName?: string;
//   isSpectator: boolean;
// };

// export type RollDiceRequest = {
//   diceRoll: number;
// };

// export type DiceRolledBroadcast = Broadcast & {
//   diceRoll: number;
// };

// export type PeerId = string;

// export type Peer = {
//   auth0Id: string;
//   displayName: string;
//   diceRoll: number;
//   characterName?: string;
// };

// export type JoinRoomRequest = {
//   roomName: string;
//   displayName: string;
//   diceRoll?: number;
//   characterName?: string;
// };

// export type JoinRoomResponse = {
//   peerList: Peer[];
// };

// export type RoomJoinedBroadcast = Broadcast & {
//   peer: Peer;
// };

// export type LeaveRoomRequest = {
//   roomName: string;
// };

// export type LeaveRoomBroadcast = Broadcast & {};

// export type UpdateDisplayNameRequest = {
//   displayName: string;
// };

// export type UpdateDisplayNameBroadcast = Broadcast & {
//   displayName: string;
// };

// export type TurnFinishedRequest = {};
// export type TurnFinishedBroadcast = Broadcast & {};
