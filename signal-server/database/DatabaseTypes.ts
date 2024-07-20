export type User = {
  readonly UserId: number;
  readonly Auth0Id: string;
  DisplayName: string;
};

export type PlayerCharacter = {
  readonly PlayerCharacterId: number;
  readonly UserId: string;
  CharacterName: string;
  DexterityMod: number;
};

export type Room = {
  readonly RoomId: number;
};
