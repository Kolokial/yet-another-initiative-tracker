export type PlayerCharacter = {
  PlayerCharacterId: number;
  UserId: number;
  CharacterName: string;
  DexterityModifier: number;
  LuckStone: boolean;
  AlertFeat: boolean;
  IsDeleted?: boolean;
};

export type PlayerCharacterDiceRoll = {
  PlayerCharacterId: number;
  RoomId: string;
  DiceRoll: number;
};
