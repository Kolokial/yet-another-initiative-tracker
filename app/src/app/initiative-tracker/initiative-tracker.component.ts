import { CommonModule } from '@angular/common';
import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MessagingService } from '../messaging.service';

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
  ],
  templateUrl: './initiative-tracker.component.html',
  styleUrl: './initiative-tracker.component.scss',
})
export class InitiativeTrackerComponent {
  @Input() public players: string[] = [];
  @Input() public playerName: string = '';

  @ViewChild('initiative') initiative!: ElementRef;
  private _isInitiativeInputDisabled: boolean = false;
  public get isInitiativeInputDisabled(): boolean {
    return this._isInitiativeInputDisabled;
  }
  initiativeValues: number[] = [];

  constructor(private messagingService: MessagingService) {
    this.initiativeValues = new Array(30);
  }

  ngBeforeViewInit() {
    console.log(this.initiative);
  }

  ngAfterContentInit() {
    console.log(this.initiative);
    this._isInitiativeInputDisabled = false;
  }

  sendInitiative(initiativeValue: string) {
    this.messagingService.sendMessage(`${initiativeValue}`);
  }
}
