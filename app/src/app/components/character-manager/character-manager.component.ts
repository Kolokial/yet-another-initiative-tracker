import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  FormControl,
  FormControlStatus,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatInputModule } from '@angular/material/input';
import { Character } from '../../types/character';
import { debounceTime } from 'rxjs';

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
  public characterForm: FormGroup<Character> = new FormGroup<Character>({
    CharacterName: new FormControl<string>(''),
    DexterityModifier: new FormControl<number>(-1),
    HasAlertFeat: new FormControl<boolean>(false),
    HasLuckStone: new FormControl<boolean>(false),
  });

  ngOnInit() {
    this.characterForm.statusChanges
      .pipe(debounceTime(2000))
      .subscribe((value: FormControlStatus) => {
        console.log(value);
      });
  }
}
