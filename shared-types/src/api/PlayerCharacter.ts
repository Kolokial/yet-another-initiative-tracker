export interface PlayerCharacter {
  PlayerCharacterId: number;
  CharacterName: string;
  AlertFeat: boolean;
  LuckStone: boolean;
  DexterityModifier: number;
}

export interface CreatePlayerCharacterRequest {
  CharacterName: string;
  AlertFeat: boolean;
  LuckStone: boolean;
  DexterityMod: number;
}

export interface CreatePlayerCharacterResponse {
  PlayerCharacterId: number;
}

export interface ReadPlayerCharacterRequest {
  PlayerCharacterId: number;
}

export interface ReadPlayerCharacterResponse {
  PlayerCharacterId: number;
  CharacterName: string;
  AlertFeat: boolean;
  LuckStone: boolean;
  DexterityMod: number;
}

export interface ReadPlayerCharactersRequest {}

export type ReadPlayerCharactersResponse = PlayerCharacter[];

export interface UpdatePlayerCharacterRequest {
  PlayerCharacterId: number;
  CharacterName: string;
  AlertFeat: boolean;
  LuckStone: boolean;
  DexterityModifier: number;
}

export interface DeletePlayerCharacterRequest {
  PlayerCharacterId: number;
}
