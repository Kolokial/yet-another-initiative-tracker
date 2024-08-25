import { FormControl, FormGroup } from '@angular/forms';
import { CharacterFormGroup } from './Character.FormGroup';
import { PlayerCharacter } from '@shared-types/api/PlayerCharacter';

export class CharacterListeItem {
  public formGroup: FormGroup<CharacterFormGroup>;
  public isUpdating: boolean = false;

  public get characterName(): FormControl<string> {
    return this.formGroup.controls.CharacterName as FormControl<string>;
  }

  public get dexterityModifier(): FormControl<number> {
    return this.formGroup.controls.DexterityModifier as FormControl<number>;
  }

  public get hasAlertFeat(): FormControl<boolean> {
    return this.formGroup.controls.HasAlertFeat as FormControl<boolean>;
  }

  public get hasLuckStone(): FormControl<boolean> {
    return this.formGroup.controls.HasLuckStone as FormControl<boolean>;
  }

  constructor(
    character: PlayerCharacter,
    public characterId?: number
  ) {
    this.formGroup = new FormGroup<CharacterFormGroup>({
      PlayerCharacterId: new FormControl<number>(character.PlayerCharacterId),
      CharacterName: new FormControl<string>(character.CharacterName),
      DexterityModifier: new FormControl<number>(character.DexterityModifier),
      HasAlertFeat: new FormControl<boolean>(character.AlertFeat),
      HasLuckStone: new FormControl<boolean>(character.LuckStone),
    });
  }
}
