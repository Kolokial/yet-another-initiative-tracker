export type Envelope<T> = {
  peerId: string;
  timestamp: number;
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
