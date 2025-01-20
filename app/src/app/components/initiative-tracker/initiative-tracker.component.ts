import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';

import { FormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import {
  Observable,
  Subject,
  Subscription,
  debounceTime,
  distinctUntilChanged,
  tap,
} from 'rxjs';
import { InitiativeTrackerStoreService } from './initiative-tracker.store.service';
import { HasTitle } from '../../types/Title';
import { AppServiceStore } from 'src/app/app.service.store';
import { SignalRService } from 'src/app/shared-services/signal-r.service';

@Component({
    selector: 'initiative-tracker',
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
    styleUrl: './initiative-tracker.component.scss'
})
export class InitiativeTrackerComponent implements HasTitle {
  @Input() public players: string[] = [];
  @Input() public playerName: string = '';
  title: string = 'Initiative Tracker';

  public get displayName(): Observable<string> {
    return this._appServiceStore.displayName;
  }

  public get dexterityModifier(): number {
    return this._appServiceStore.selectedCharacter.value?.dexterityMod || 0;
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

  public get initiativeValue(): number {
    return this._dataStore.initiativeRoll;
  }
  public set initiativeValue(v: number) {
    this._dataStore.initiativeRoll = v;
  }

  private keyup$: Subject<number> = new Subject<number>();
  private keyupSubscription!: Subscription;

  private lastSentRoll: number = 0;
  private impendingRoll: number = 0;

  constructor(
    private _dataStore: InitiativeTrackerStoreService,
    private _appServiceStore: AppServiceStore,
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

  sendInitiative(initiativeString: number) {
    let initiativeValue = parseInt(`${initiativeString}`);
    this._appServiceStore.lastDiceRoll = initiativeValue;
    if (this.dexterityModifier) {
      initiativeValue += this.dexterityModifier;
    }

    if (this.alertFeat) {
      initiativeValue += 5;
    }

    this._signalR
      .rollDice(initiativeValue)
      .subscribe((x) => console.log('Dice roll sent:', initiativeValue));

    this._appServiceStore.lastSentRoll = initiativeValue;
  }

  onInitiativeKeyUp(initiative: number) {
    this.keyup$.next(initiative);
  }
}
