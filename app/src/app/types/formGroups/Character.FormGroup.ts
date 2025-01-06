import { FormControl } from '@angular/forms';

export interface CharacterFormGroup {
  PlayerCharacterId: FormControl<number | null>;
  CharacterName: FormControl<string | null>;
  DexterityModifier: FormControl<number | null>;
  HasAlertFeat: FormControl<boolean | null>;
  HasLuckStone: FormControl<boolean | null>;
  IsInPlay: FormControl<boolean | null>;
}
