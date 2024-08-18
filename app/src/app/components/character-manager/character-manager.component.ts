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
import { debounceTime } from 'rxjs';
import { CharacterManagerApiService } from './character-manager.service';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIcon } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CharacterListeItem as CharacterListItem } from 'src/app/types/formGroups/CharacterListItem';

@Component({
  selector: 'character-manager',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatInputModule,
    ReactiveFormsModule,
    MatSlideToggleModule,
    MatExpansionModule,
    MatIcon,
    MatProgressSpinnerModule,
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
  public characterForm: CharacterListItem[] = [
    new CharacterListItem({
      PlayerCharacterId: 0,
      CharacterName: '',
      DexterityModifier: 0,
      AlertFeat: false,
      LuckStone: false,
    }),
  ];

  constructor(private characterService: CharacterManagerApiService) {}

  ngOnInit() {
    this.setupCharacterList();
    // this.characterForm.statusChanges
    //   .pipe(debounceTime(1000))
    //   .subscribe((value: FormControlStatus) => {
    //     console.log(value, this.characterForm.value);
    //     this.characterForm.controls[0].controls;
    //     this.characterService
    //       .createCharacter(
    //         this.characterForm.controls[0].controls.CharacterName.value as string,
    //         this.characterForm.controls[0].controls.HasAlertFeat.value as boolean,
    //         this.characterForm.controls[0].controls.HasLuckStone.value as boolean,
    //         this.characterForm.controls[0].controls.DexterityModifier.value as number
    //       )
    //       .subscribe();
    //   });
  }

  private setupCharacterList(): void {
    this.characterService.readCharacters().subscribe((readCharacterResponse) => {
      readCharacterResponse.forEach((x) => {
        const characterGroup = new CharacterListItem(x);
        this.setCharacterGroupStatusChange(characterGroup, x.PlayerCharacterId);
        this.characterForm.push(characterGroup);
      });
    });
  }

  private setCharacterGroupStatusChange(
    character: CharacterListItem,
    playerCharacterId: number
  ) {
    character.formGroup.statusChanges
      .pipe(debounceTime(1000))
      .subscribe((value: FormControlStatus) => {
        if (value === 'VALID') {
          character.isUpdating = true;
          this.characterService
            .updateCharacter(
              playerCharacterId,
              character.formGroup.controls.CharacterName.value as string,
              character.formGroup.controls.HasAlertFeat.value as boolean,
              character.formGroup.controls.HasLuckStone.value as boolean,
              character.formGroup.controls.DexterityModifier.value as number
            )
            .subscribe(() => {
              console.log('next');
              character.isUpdating = false;
            });
        }
      });
  }

  public getCharacterSummary(character: FormGroup<CharacterFormGroup>) {
    return `Dex: ${character.controls.DexterityModifier.value}` + ``;
  }
}
