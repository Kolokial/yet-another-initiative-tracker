import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  FormControlStatus,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatInputModule } from '@angular/material/input';
import { CharacterFormGroup } from '../../types/formGroups/Character.FormGroup';
import { debounceTime, Subject } from 'rxjs';
import { CharacterManagerApiService } from './character-manager.service';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIcon } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CharacterListItem } from 'src/app/types/formGroups/CharacterListItem';
import { MatButtonModule } from '@angular/material/button';
import { MatRadioModule } from '@angular/material/radio';
import { MatTableModule } from '@angular/material/table';
import { AppServiceStore } from 'src/app/app.service.store';

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
    MatRadioModule,
    MatIcon,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatTableModule,
  ],
  templateUrl: './character-manager.component.html',
  styleUrl: './character-manager.component.scss',
  animations: [
    trigger('detailExpand', [
      state('collapsed,void', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition(
        'expanded <=> collapsed',
        animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')
      ),
    ]),
  ],
})
export class CharacterManagerComponent {
  /* TODO: 
    Set character name
    set character profile picture
    set character musical cue?
    Set initiative bonuses
  */
  public characterForm: CharacterListItem[] = [];
  public characterFormSource = new Subject<CharacterListItem>();
  columnsToDisplay = [
    'select',
    'characterName',
    'dexterityModifier',
    'hasAlertFeat',
    'hasLuckStone',
  ];
  columnsToDisplayWithExpand = [...this.columnsToDisplay, 'expand'];
  expandedElement!: CharacterListItem | null;

  constructor(
    private characterService: CharacterManagerApiService,
    private appServiceStore: AppServiceStore
  ) {}

  ngOnInit() {
    this.setupCharacterList();
  }

  addCharacterForm() {
    const newCharacter = new CharacterListItem({
      playerCharacterId: 0,
      characterName: '',
      dexterityMod: 0,
      alertFeat: false,
      luckStone: false,
    });
    this.characterForm = [newCharacter, ...this.characterForm];
    this.expandedElement = newCharacter;
  }

  createCharacter(character: CharacterListItem) {
    character.isUpdating = true;
    this.characterService
      .createCharacter(
        character.characterName,
        character.hasAlertFeat,
        character.hasLuckStone,
        character.dexterityModifier
      )
      .subscribe((createCharacterResponse) => {
        character.characterId = createCharacterResponse.playerCharacterId;
        character.isUpdating = false;
        this.characterForm = [...this.characterForm];
      });
  }

  deleteCharacter(character: CharacterListItem) {
    if (character.characterId) {
      this.characterService
        .deleteCharacter(character.characterId as number)
        .subscribe(() => {
          const index = this.characterForm.findIndex((char) => char === character);
          if (index > -1) {
            this.characterForm.splice(index, 1);
          }
        });
    } else {
      this.characterForm = [...this.characterForm.filter((x) => x !== character)];
    }
  }

  toggleCharacterSelect(row: any) {
    if (!row.characterId) {
      return;
    }
    this.appServiceStore.selectedCharacter.next({
      playerCharacterId: row.characterId as number,
      alertFeat: row.hasAlertFeat,
      characterName: row.characterName,
      dexterityMod: row.dexterityModifier,
      luckStone: row.hasLuckStone,
    });
  }

  isSelected(row: any) {}

  private setupCharacterList(): void {
    this.characterService.readCharacters().subscribe((readCharacterResponse) => {
      readCharacterResponse.reverse().forEach((x) => {
        const characterGroup = new CharacterListItem(x, x.playerCharacterId);
        this.setCharacterGroupStatusChange(characterGroup, x.playerCharacterId);
        this.characterForm.push(characterGroup);
      });
      this.characterForm = [...this.characterForm];
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
