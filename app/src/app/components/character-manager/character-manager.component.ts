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
import { debounceTime, Observable, Subject } from 'rxjs';
import { CharacterManagerApiService } from './character-manager.service';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIcon } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CharacterListItem } from 'src/app/types/formGroups/CharacterListItem';
import { MatButtonModule } from '@angular/material/button';
import { MatRadioModule } from '@angular/material/radio';
import { MatTableModule } from '@angular/material/table';
import { AppServiceStore } from 'src/app/app.service.store';
import { ReadPlayerCharacterResponse } from 'src/app/types/api/PlayerCharacter';
import { SignalRService } from 'src/app/shared-services/signal-r.service';

@Component({
    selector: 'character-manager',
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
            transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
        ]),
    ]
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
        character.playerCharacterId = createCharacterResponse.playerCharacterId;
        character.isUpdating = false;
        this.characterForm = [...this.characterForm];
      });
  }

  deleteCharacter(character: CharacterListItem) {
    if (character.playerCharacterId) {
      this.characterService
        .deleteCharacter(character.playerCharacterId as number)
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

  toggleCharacterSelect(character: CharacterListItem) {
    if (!character.playerCharacterId) {
      return;
    }

    this.appServiceStore.selectedCharacter.next({
      playerCharacterId: character.playerCharacterId as number,
      alertFeat: character.hasAlertFeat,
      characterName: character.characterName,
      dexterityMod: character.dexterityModifier,
      luckStone: character.hasLuckStone,
    });

    this.characterForm.forEach((x) => {
      if (x.isDeleted) {
        x.isInPlay = false;
      }
    });
    character.isInPlay = true;
    this.updateCharacter(character, character.playerCharacterId);
    this._signalR.updateCharacterInPlayName(character.characterName).subscribe();
    this._signalR.rollDice(
      this.appServiceStore.lastDiceRoll + character.dexterityModifier
    );
  }

  isSelected(row: CharacterListItem) {}

  private setupCharacterList(): void {
    this.characterService.readCharacters().subscribe((readCharacterResponse) => {
      readCharacterResponse.reverse().forEach((x) => {
        if (x.isDeleted) {
          return;
        }
        const characterGroup = new CharacterListItem(x, x.playerCharacterId);
        this.setCharacterGroupStatusChange(characterGroup, x.playerCharacterId);
        this.setupCharacterNameStatusChange(characterGroup);
        this.characterForm.push(characterGroup);
      });
      this.characterForm = [...this.characterForm];
    });
  }

  private setCharacterGroupStatusChange(
    character: CharacterListItem,
    playerCharacterId: number
  ): void {
    character.formGroup.statusChanges
      .pipe(debounceTime(1000))
      .subscribe((status: FormControlStatus) => {
        if (status === 'VALID') {
          this.updateCharacter(character, playerCharacterId);
          this.appServiceStore.selectedCharacter.next(character.getPlayerCharacter());
        }
      });
  }

  private setupCharacterNameStatusChange(character: CharacterListItem): void {
    character.formGroup.controls.CharacterName.statusChanges.subscribe((status) => {
      if (status === 'VALID') {
        this._signalR.updateCharacterInPlayName(character.characterName).subscribe();
      }
    });
  }

  private updateCharacter(
    character: CharacterListItem,
    playerCharacterId: number
  ): Observable<ReadPlayerCharacterResponse> {
    character.isUpdating = true;
    const observable = this.characterService.updateCharacter(
      playerCharacterId,
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
