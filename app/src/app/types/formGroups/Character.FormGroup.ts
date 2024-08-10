import { FormControl } from '@angular/forms';

export interface CharacterFormGroup {
  CharacterName: FormControl<string | null>;
  DexterityModifier: FormControl<number | null>;
  HasAlertFeat: FormControl<boolean | null>;
  HasLuckStone: FormControl<boolean | null>;
}
