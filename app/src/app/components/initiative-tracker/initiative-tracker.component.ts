import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { Subject, Subscription, debounceTime, distinctUntilChanged, tap } from 'rxjs';
import { InitiativeTrackerStoreService } from './initiative-tracker.store.service';
import { SignalRService } from 'src/app/shared-services/signal-r.service';
import { CharacterListItem } from 'src/app/types/formGroups/CharacterListItem';

@Component({
  selector: 'initiative-tracker',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatDividerModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    FormsModule,
    MatCheckboxModule,
  ],
  templateUrl: './initiative-tracker.component.html',
  styleUrl: './initiative-tracker.component.scss',
})
export class InitiativeTrackerComponent {
  @Input()
  private character!: CharacterListItem;

  public get displayName(): string {
    return this.character.characterName;
  }

  public get dexterityModifier(): number {
    return this.character.dexterityModifier || 0;
  }

  public set dexterityModifier(value: string) {
    this._dataStore.dexterityScore = parseInt(value);
  }

  public get alertFeat(): boolean {
    return this._dataStore.alertFeat;
  }

  public set alertFeat(value: boolean) {
    this._dataStore.alertFeat = value;
  }

  public get luckStone(): boolean {
    return this._dataStore.luckStone;
  }
  public set luckStone(v: boolean) {
    this._dataStore.luckStone = v;
  }

  private _isInitiativeInputDisabled: boolean = false;
  public get isInitiativeInputDisabled(): boolean {
    return this._isInitiativeInputDisabled;
  }

  public initiativeValue: number = 0;

  private keyup$: Subject<number> = new Subject<number>();
  private keyupSubscription!: Subscription;

  private lastSentRoll: number = 0;
  private impendingRoll: number = 0;

  constructor(
    private _dataStore: InitiativeTrackerStoreService,
    private _signalR: SignalRService
  ) {}

  ngOnInit() {
    this.keyupSubscription = this.keyup$
      .pipe(
        tap((initiative) => {
          this.impendingRoll = initiative;
        }),
        debounceTime(1000),
        distinctUntilChanged()
      )
      .subscribe((initiative) => {
        this.sendInitiative(initiative);
      });
  }

  ngOnDestroy() {
    if (this.lastSentRoll !== this.impendingRoll) {
      this.sendInitiative(this.impendingRoll);
    }
    this.keyupSubscription.unsubscribe();
  }

  ngAfterViewInit() {
    this._isInitiativeInputDisabled = false;
  }

  triggerInitiative() {
    this.sendInitiative(this.initiativeValue);
  }

  sendInitiative(initiativeString: number) {
    let initiativeValue = parseInt(`${initiativeString}`);
    this.character.lastDiceRoll = initiativeValue;
    if (this.dexterityModifier) {
      initiativeValue += this.dexterityModifier;
    }

    if (this.alertFeat) {
      initiativeValue += 5;
    }

    this._signalR
      .rollDice(initiativeValue)
      .subscribe((x) => console.log('Dice roll sent:', initiativeValue));

    this.character.lastSentRoll = initiativeValue;
  }

  onInitiativeKeyUp() {
    this.keyup$.next(this.initiativeValue);
  }
}
