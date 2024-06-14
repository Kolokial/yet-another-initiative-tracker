import { CommonModule } from '@angular/common';
import { Component, ElementRef, Input, NgModule, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MessagingService } from '../messaging.service';
import { FormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';

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
  @Input() public players: string[] = [];
  @Input() public playerName: string = '';

  private _dexterityModifier: number = 0;
  public get dexterityModifier(): number {
    return this._dexterityModifier;
  }

  public set dexterityModifier(value: string) {
    this._dexterityModifier = parseInt(value);
  }
  public alertFeat: boolean = false;

  @ViewChild('initiative') initiative!: ElementRef;
  private _isInitiativeInputDisabled: boolean = false;
  public get isInitiativeInputDisabled(): boolean {
    return this._isInitiativeInputDisabled;
  }
  initiativeValue!: number;

  constructor(private messagingService: MessagingService) {
  }

  ngAfterViewInit() {
    console.log(this.initiative);
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
    this.messagingService.sendDiceRollMessage(`${initiativeValue}`);
  }
}
