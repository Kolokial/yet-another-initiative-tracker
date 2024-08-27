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
