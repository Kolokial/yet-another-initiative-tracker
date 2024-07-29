import { FormControl } from '@angular/forms';

export type Character = {
  CharacterName: FormControl<string | null>;
  DexterityModifier: FormControl<number | null>;
  HasAlertFeat: FormControl<boolean | null>;
  HasLuckStone: FormControl<boolean | null>;
};
