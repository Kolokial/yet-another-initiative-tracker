import { FormControl, FormGroup } from '@angular/forms';
import { CharacterFormGroup } from './Character.FormGroup';
import { PlayerCharacter } from '@shared-types/api/PlayerCharacter';

export class CharacterListItem {
  public formGroup: FormGroup<CharacterFormGroup>;
  public isUpdating: boolean = false;

  public get characterName(): string {
    return this.formGroup.controls.CharacterName.value as string;
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
    return this.formGroup.controls.IsInPlay.value as boolean;
  }

  public get isDeleted(): boolean {
    return this._character.isDeleted;
  }

  constructor(
    private _character: PlayerCharacter,
    public characterId?: number
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
}
