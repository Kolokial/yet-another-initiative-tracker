import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { Subject, Subscription, debounceTime, distinctUntilChanged, tap } from 'rxjs';
import { SignalRService } from 'src/app/shared-services/signal-r.service';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Character } from 'src/app/types/messageContracts/Character';

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
  public get displayName(): string {
    return this.character.name;
  }

  public get dexterityModifier(): number {
    return this.character.dexterityMod || 0;
  }

  private _isInitiativeInputDisabled: boolean = false;
  public get isInitiativeInputDisabled(): boolean {
    return this._isInitiativeInputDisabled;
  }

  public initiativeValue!: number;

  private keyup$: Subject<number> = new Subject<number>();
  private keyupSubscription!: Subscription;

  private lastSentRoll: number = 0;
  private impendingRoll: number = 0;

  character: Character = inject(MAT_DIALOG_DATA);

  constructor(private _signalR: SignalRService) {}

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
    this.keyup$.next(this.initiativeValue);
  }

  sendInitiative(initiativeString: number) {
    let initiativeValue = parseInt(`${initiativeString}`);

    if (this.dexterityModifier) {
      initiativeValue += this.dexterityModifier;
    }

    this._signalR
      .rollDice(initiativeValue, this.character.id)
      .subscribe((x) => console.log('Dice roll sent:', initiativeValue));
    this.character.initiative = initiativeValue;
    this.lastSentRoll = initiativeValue;
  }

  onInitiativeKeyUp() {
    this.keyup$.next(this.initiativeValue);
  }
}
