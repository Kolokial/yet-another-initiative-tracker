import { FormControl, FormGroup } from '@angular/forms';
import { CharacterFormGroup } from './Character.FormGroup';
import { PlayerCharacter } from '@shared-types/api/PlayerCharacter';

export class CharacterListItem {
  public formGroup: FormGroup<CharacterFormGroup>;
  public isUpdating: boolean = false;

  public get characterName(): string {
    return this.formGroup.controls.CharacterName.value as string;
  }

  public get playerCharacterId(): number {
    return this.formGroup.controls.PlayerCharacterId.value as number;
  }

  public set playerCharacterId(id: number) {
    this.formGroup.controls.PlayerCharacterId.setValue(id, { emitEvent: false });
  }

  public get dexterityModifier(): number {
    return this.formGroup.controls.DexterityModifier.value as number;
  }

  public get hasAlertFeat(): boolean {
    return this.formGroup.controls.HasAlertFeat.value as boolean;
  }

  public get hasLuckStone(): boolean {
    return this.formGroup.controls.HasLuckStone.value as boolean;
  }

  public get isInPlay(): boolean {
    return this._character.isInPlay;
  }

  public set isInPlay(isInPlay: boolean) {
    this._character.isInPlay = isInPlay;
  }

  public get isDeleted(): boolean {
    return this._character.isDeleted;
  }

  public set isDeleted(isDeleted: boolean) {
    this._character.isDeleted = isDeleted;
  }

  constructor(
    private _character: PlayerCharacter,
    private _characterId?: number
  ) {
    this.formGroup = new FormGroup<CharacterFormGroup>({
      PlayerCharacterId: new FormControl<number>(_character.playerCharacterId),
      CharacterName: new FormControl<string>(_character.characterName),
      DexterityModifier: new FormControl<number>(_character.dexterityMod),
      HasAlertFeat: new FormControl<boolean>(_character.alertFeat),
      HasLuckStone: new FormControl<boolean>(_character.luckStone),
      IsInPlay: new FormControl<boolean>(_character.isInPlay),
    });
  }

  public getPlayerCharacter(): PlayerCharacter {
    return {
      alertFeat: this.hasAlertFeat,
      characterName: this.characterName,
      dexterityMod: this.dexterityModifier,
      isDeleted: this.isDeleted,
      isInPlay: this.isInPlay,
      luckStone: this.hasLuckStone,
      playerCharacterId: this.playerCharacterId,
    };
  }
}
