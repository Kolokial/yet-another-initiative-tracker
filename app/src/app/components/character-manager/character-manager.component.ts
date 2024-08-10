import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  FormArray,
  FormControl,
  FormControlStatus,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatInputModule } from '@angular/material/input';
import { CharacterFormGroup } from '../../types/formGroups/Character.FormGroup';
import { debounceTime, Observable } from 'rxjs';
import { CharacterManagerApiService } from './character-manager.service';
import { PlayerCharacter } from '@shared-types/api/PlayerCharacter';

@Component({
  selector: 'character-manager',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatInputModule,
    ReactiveFormsModule,
    MatSlideToggleModule,
  ],
  templateUrl: './character-manager.component.html',
  styleUrl: './character-manager.component.scss',
})
export class CharacterManagerComponent {
  /* TODO: 
    Set character name
    set character profile picture
    set character musical cue?
    Set initiative bonuses
  */
  public characterForm: FormArray<FormGroup<CharacterFormGroup>> = new FormArray<
    FormGroup<CharacterFormGroup>
  >([
    new FormGroup<CharacterFormGroup>({
      CharacterName: new FormControl<string>(''),
      DexterityModifier: new FormControl<number>(0),
      HasAlertFeat: new FormControl<boolean>(false),
      HasLuckStone: new FormControl<boolean>(false),
    }),
  ]);

  constructor(private characterService: CharacterManagerApiService) {}

  ngOnInit() {
    this.setupCharacterList();
    this.characterForm.statusChanges
      .pipe(debounceTime(1000))
      .subscribe((value: FormControlStatus) => {
        console.log(value, this.characterForm.value);
        this.characterForm.controls[0].controls;
        this.characterService
          .createCharacter(
            this.characterForm.controls[0].controls.CharacterName.value as string,
            this.characterForm.controls[0].controls.HasAlertFeat.value as boolean,
            this.characterForm.controls[0].controls.HasLuckStone.value as boolean,
            this.characterForm.controls[0].controls.DexterityModifier.value as number
          )
          .subscribe();
      });
  }

  private setupCharacterList(): void {
    this.characterService.readCharacters().subscribe((readCharacterResponse) => {
      readCharacterResponse.PlayerCharacters.forEach((x) => {
        const characterGroup = new FormGroup<CharacterFormGroup>({
          CharacterName: new FormControl<string>(x.CharacterName),
          DexterityModifier: new FormControl<number>(x.DexterityMod),
          HasAlertFeat: new FormControl<boolean>(x.AlertFeat),
          HasLuckStone: new FormControl<boolean>(false),
        });
        this.setCharacterGroupStatusChange(characterGroup.statusChanges, x);
        this.characterForm.controls.push(characterGroup);
      });
    });
  }

  private setCharacterGroupStatusChange(
    statusChanges$: Observable<FormControlStatus>,
    character: PlayerCharacter
  ) {
    statusChanges$.pipe(debounceTime(1000)).subscribe((value: FormControlStatus) => {
      if (value === 'VALID') {
        this.characterService.updateCharacter(
          character.PlayerCharacterId,
          character.CharacterName,
          character.AlertFeat,
          character.LuckStone,
          character.DexterityMod
        );
      }
    });
  }
}
