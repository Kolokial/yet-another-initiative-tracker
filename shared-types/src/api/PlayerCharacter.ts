export interface PlayerCharacter {
  playerCharacterId: number;
  characterName: string;
  alertFeat: boolean;
  luckStone: boolean;
  dexterityMod: number;
  isInPlay: boolean;
  isDeleted: boolean;
}

export interface CreatePlayerCharacterRequest {
  characterName: string;
  alertFeat: boolean;
  luckStone: boolean;
  dexterityMod: number;
}

export interface CreatePlayerCharacterResponse {
  playerCharacterId: number;
}

export interface ReadPlayerCharacterRequest {
  playerCharacterId: number;
}

export interface ReadPlayerCharacterResponse extends PlayerCharacter {}

export interface ReadPlayerCharactersRequest {}

export type ReadPlayerCharactersResponse = PlayerCharacter[];

export interface UpdatePlayerCharacterRequest {
  playerCharacterId: number;
  characterName: string;
  alertFeat: boolean;
  luckStone: boolean;
  dexterityMod: number;
  isInPlay: boolean;
}

export interface DeletePlayerCharacterRequest {
  playerCharacterId: number;
}
