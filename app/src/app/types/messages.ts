export type Envelope<T> = {
  peerId: string;
  timestamp: number;
  message: T;
  isTurnFinished?: boolean;
};

export type ProfileUpdateMessage = {
  displayName: string;
  playerCharacterName?: string;
};

export type DiceRollMessage = {
  diceRoll: number;
  isTurnFinished: boolean;
};
