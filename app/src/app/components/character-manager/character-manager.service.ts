import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthService } from '@auth0/auth0-angular';
import { BaseApi } from 'src/app/shared-services/BaseApi';
import {
  CreatePlayerCharacterRequest,
  CreatePlayerCharacterResponse,
  DeletePlayerCharacterRequest,
  ReadPlayerCharacterResponse,
  ReadPlayerCharactersResponse,
  UpdatePlayerCharacterRequest,
} from '@shared-types/api/PlayerCharacter';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CharacterManagerApiService extends BaseApi {
  constructor(http: HttpClient, auth: AuthService) {
    super(http, auth);
  }

  public createCharacter(
    name: string,
    HasAlertFeat: boolean,
    HasLuckStone: boolean,
    dexMod: number
  ): Observable<CreatePlayerCharacterResponse> {
    return this.postRequest<CreatePlayerCharacterRequest, CreatePlayerCharacterResponse>(
      `/api/user/character`,
      {
        CharacterName: name,
        AlertFeat: HasAlertFeat,
        LuckStone: HasLuckStone,
        DexterityMod: dexMod,
      }
    );
  }

  public readCharacter(characterId: number): Observable<ReadPlayerCharacterResponse> {
    return this.getRequest<ReadPlayerCharacterResponse>(
      `api/user/character/${characterId}`
    );
  }

  public readCharacters(): Observable<ReadPlayerCharactersResponse> {
    return this.getRequest<ReadPlayerCharactersResponse>(`/api/user/characters`);
  }

  public updateCharacter(
    characterId: number,
    name: string,
    hasAlertFeat: boolean,
    hasLuckStone: boolean,
    dexMod: number
  ): Observable<ReadPlayerCharacterResponse> {
    return this.patchRequest<UpdatePlayerCharacterRequest, ReadPlayerCharacterResponse>(
      `/api/user/character/${characterId}`,
      {
        PlayerCharacterId: characterId,
        CharacterName: name,
        AlertFeat: hasAlertFeat,
        LuckStone: hasLuckStone,
        DexterityModifier: dexMod,
      }
    );
  }

  public deleteCharacter(characterId: number): Observable<DeletePlayerCharacterRequest> {
    return this.deleteRequest(`/api/user/character/${characterId}`);
  }
}
