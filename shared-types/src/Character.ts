export type PlayerCharacter = {
  PlayerCharacterId?: number;
  UserId: number;
  CharacterName: string;
  DexterityMod: number;
  LuckStone: boolean;
  AlertFeat: boolean;
  IsDeleted?: boolean;
};

export type PlayerCharacterDiceRoll = {
  PlayerCharacterId: number;
  RoomId: string;
  DiceRoll: number;
};
