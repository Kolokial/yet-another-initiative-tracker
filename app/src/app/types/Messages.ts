export type Envelope<T> = {
  auth0Id: string;
  dateStamp: Date;
  message: T;
};

export type ProfileUpdateMessage = {
  displayName: string;
  playerCharacterName?: string;
  isSpectator: boolean;
};

export type DiceRollMessage = {
  diceRoll: number;
  isTurnFinished: boolean;
};

export type PeerId = string;

export type Peer = {
  displayName: string;
  diceRoll: number;
  characterName?: string;
};

export type PeerList = [
  {
    displayName: string;
    auth0Id: string;
    diceRoll: number;
    characterName?: string;
  },
];

export type JoinRoomMessage = {
  roomName: string;
  peer: Peer;
};

export type LeaveRoomMessage = {
  roomName: string;
};

export type UpdateDisplayNameRequest = {
  displayName: string;
};

export type UpdateDisplayNameBroadcast = {
  auth0Id: string;
  displayName: string;
};
