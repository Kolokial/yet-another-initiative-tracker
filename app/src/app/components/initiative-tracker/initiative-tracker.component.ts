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
export class InitiativeTrackerComponent implements HasTitle {
  @Input() public players: string[] = [];
  @Input() public playerName: string = '';
  title: string = 'Initiative Tracker';

  public get displayName(): Observable<string> {
    return this.appServiceStore.displayName;
  }

  public get dexterityModifier(): number {
    return this.dataStore.dexterityScore;
  }

  public set dexterityModifier(value: string) {
    this.dataStore.dexterityScore = parseInt(value);
  }

  public get alertFeat(): boolean {
    return this.dataStore.alertFeat;
  }

  public set alertFeat(value: boolean) {
    this.dataStore.alertFeat = value;
  }

  public get luckStone(): boolean {
    return this.dataStore.luckStone;
  }
  public set luckStone(v: boolean) {
    this.dataStore.luckStone = v;
  }

  private _isInitiativeInputDisabled: boolean = false;
  public get isInitiativeInputDisabled(): boolean {
    return this._isInitiativeInputDisabled;
  }

  public get initiativeValue(): number {
    return this.dataStore.initiativeRoll;
  }
  public set initiativeValue(v: number) {
    this.dataStore.initiativeRoll = v;
  }

  private keyup$: Subject<number> = new Subject<number>();
  private keyupSubscription!: Subscription;

  private lastSentRoll: number = 0;
  private impendingRoll: number = 0;

  constructor(
    private dataStore: InitiativeTrackerStoreService,
    private appServiceStore: AppServiceStore
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
    if (this.dexterityModifier) {
      initiativeValue += this.dexterityModifier;
    }

    if (this.alertFeat) {
      initiativeValue += 5;
    }
    this.appServiceStore.lastSentRoll = initiativeValue;
  }

  onInitiativeKeyUp(initiative: number) {
    this.keyup$.next(initiative);
  }
}
