import { CommonModule } from '@angular/common';
import { Component, Input, ViewChild } from '@angular/core';
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
import { debounceTime, Observable, Subject } from 'rxjs';
import { CharacterManagerApiService } from './character-manager.service';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIcon } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CharacterListItem } from 'src/app/types/formGroups/CharacterListItem';
import { MatButtonModule } from '@angular/material/button';
import { MatRadioModule } from '@angular/material/radio';
import { MatTable, MatTableModule } from '@angular/material/table';
import { AppServiceStore } from 'src/app/app.service.store';
import { ReadPlayerCharacterResponse } from 'src/app/types/api/PlayerCharacter';
import { SignalRService } from 'src/app/shared-services/signal-r.service';
import { MatCheckboxChange, MatCheckboxModule } from '@angular/material/checkbox';

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
    MatCheckboxModule,
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
  private _showInPlayColumn: boolean = false;
  @Input()
  public set showInPlayColumn(value: boolean) {
    this._showInPlayColumn = value;
    if (value) {
      this.columnsToDisplay = ['select', ...this.columnsToDisplay];
      this.columnsToDisplayWithExpand = [...this.columnsToDisplay, 'expand'];
    }
  }

  public get showInPlayColumn(): boolean {
    return this._showInPlayColumn;
  }

  @Input()
  public inPlayColumnControl: InputSelectionType = 'radio';

  @Input()
  public maxCharacterSelect: number = 1;

  @ViewChild(MatTable) table!: MatTable<CharacterListItem>;

  public characterForm: CharacterListItem[] = [];
  public characterFormSource = new Subject<CharacterListItem>();
  public columnsToDisplay = [
    'characterName',
    'dexterityModifier',
    'hasAlertFeat',
    'hasLuckStone',
  ];
  public columnsToDisplayWithExpand = [...this.columnsToDisplay, 'expand'];
  public expandedElement!: CharacterListItem | null;

  constructor(
    private characterService: CharacterManagerApiService,
    private appServiceStore: AppServiceStore,
    private _signalR: SignalRService
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
      isInPlay: false,
      isDeleted: false,
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

        this.setCharacterGroupStatusChange(character);
        this.setupCharacterNameStatusChange(character);
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
            this.characterForm = [...this.characterForm];
          }
        });
    } else {
      this.characterForm = [...this.characterForm.filter((x) => x !== character)];
    }
  }

  toggleSingleCharacterSelect(characterListItem: CharacterListItem) {
    if (!characterListItem.characterId) {
      return;
    }

    const previousCharacterId = this.appServiceStore.selectedCharacter.value[0].id;
    this.appServiceStore.selectedCharacter.next([
      characterListItem.getCharacter(this.appServiceStore.auth0Id),
    ]);

    this.characterForm.forEach((x) => {
      if (x.isDeleted) {
        x.isInPlay = false;
      }
    });
    characterListItem.isInPlay = true;
    this.updateCharacter(characterListItem);
    this._signalR.removeCharacter(previousCharacterId).subscribe((x) => console.log(x));
    this._signalR
      .addCharacter(characterListItem.getCharacter(this.appServiceStore.auth0Id))
      .subscribe((x) => console.log(x));
    this._signalR.rollDice(
      this.appServiceStore.lastDiceRoll + characterListItem.dexterityModifier,
      characterListItem.characterId
    );
  }

  toggleMultipleCharacterSelect(
    character: CharacterListItem,
    checkboxEvent: MatCheckboxChange
  ) {
    console.log(checkboxEvent, character.characterId);
    if (!character.characterId) {
      return;
    }

    character.isInPlay = checkboxEvent.checked;
    const selectedCharacters = this.appServiceStore.selectedCharacter.value;

    if (checkboxEvent.checked === true) {
      selectedCharacters.push(character.getCharacter(this.appServiceStore.auth0Id));
      this._signalR
        .addCharacter(character.getCharacter(this.appServiceStore.auth0Id))
        .subscribe();
      this._signalR.rollDice(
        this.appServiceStore.lastDiceRoll + character.dexterityModifier,
        character.characterId
      );
    } else if (checkboxEvent.checked === false) {
      const index = selectedCharacters.findIndex((x) => x.id === character.characterId);

      if (index !== -1) {
        selectedCharacters.splice(index, 1);
      }
      this._signalR.removeCharacter(character.characterId).subscribe();
    }

    this.appServiceStore.selectedCharacter.next(selectedCharacters);
    this.updateCharacter(character);
  }

  isSelected(row: CharacterListItem) {}

  private setupCharacterList(): void {
    this.characterService.readCharacters().subscribe((readCharacterResponse) => {
      readCharacterResponse.reverse().forEach((x) => {
        if (x.isDeleted) {
          return;
        }
        const characterGroup = new CharacterListItem(x, x.playerCharacterId);
        this.setCharacterGroupStatusChange(characterGroup);
        this.setupCharacterNameStatusChange(characterGroup);
        this.characterForm.push(characterGroup);
      });
      this.characterForm = [...this.characterForm];
    });
  }

  private setCharacterGroupStatusChange(character: CharacterListItem): void {
    character.formGroup.statusChanges
      .pipe(debounceTime(1000))
      .subscribe((status: FormControlStatus) => {
        if (status === 'VALID') {
          this.updateCharacter(character);
          this.appServiceStore.selectedCharacter.next([
            character.getCharacter(this.appServiceStore.auth0Id),
          ]);
        }
      });
  }

  private setupCharacterNameStatusChange(character: CharacterListItem): void {
    character.formGroup.controls.CharacterName.statusChanges.subscribe((status) => {
      if (status === 'VALID' && character.isInPlay) {
        this._signalR
          .updateCharacterInPlayName(character.characterId, character.characterName)
          .subscribe();
      }
    });
  }

  private updateCharacter(
    character: CharacterListItem
  ): Observable<ReadPlayerCharacterResponse> {
    character.isUpdating = true;
    const observable = this.characterService.updateCharacter(
      character.characterId,
      character.characterName,
      character.hasAlertFeat,
      character.hasLuckStone,
      character.dexterityModifier,
      character.isInPlay
    );

    observable.subscribe(() => {
      character.isUpdating = false;
    });

    return observable;
  }

  public getCharacterSummary(character: FormGroup<CharacterFormGroup>): string {
    return `Dex: ${character.controls.DexterityModifier.value}` + ``;
  }
}

export type InputSelectionType = 'radio' | 'checkbox';
