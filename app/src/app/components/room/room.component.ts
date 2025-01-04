import { Component, EventEmitter, Output } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { RoomService } from './room.service';
import { Observable } from 'rxjs';
import { AuthService } from '@auth0/auth0-angular';
import { HasTitle } from '../../types/Title';
import { AppServiceStore } from 'src/app/app.service.store';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { InitiativeListComponent } from '../initiative-list/initiative-list.component';
import { Peer } from 'src/app/types/messageContracts/Peer';

@Component({
  selector: 'room',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatInputModule,
    MatButtonModule,
    MatSlideToggleModule,
    InitiativeListComponent,
  ],
  templateUrl: './room.component.html',
  styleUrl: './room.component.scss',
})
export class RoomComponent implements HasTitle {
  activeLink: any;
  readonly title: string = 'Room Manager';
  public roomCode: string = '';

  public set isSpectator(value: boolean) {
    this.appServiceStore.isSpectator.next(value);
  }

  public get isSpectator(): boolean {
    return this.appServiceStore.isSpectator.getValue();
  }

  get myPeerId(): Observable<string> {
    return this.roomService.myPeerId;
  }

  get roomId(): Observable<string> {
    return this.roomService.roomId;
  }

  private get displayName(): string {
    return this.appServiceStore.displayName.getValue();
  }

  public peerList: Peer[] = [];

  constructor(
    private appServiceStore: AppServiceStore,
    private roomService: RoomService,

    public auth: AuthService
  ) {}

  createRoom() {
    if (this.displayName.length) {
      this.roomService.createRoom().subscribe((peerList: Peer[]) => {
        this.peerList = peerList;
      });
    }
  }

  joinRoomWithCode(roomId: string) {
    if (this.displayName.length) {
      this.roomService.joinRoom(roomId).subscribe((peerList: Peer[]) => {
        this.peerList = peerList;
      });
    }
  }

  leaveRoom() {
    this.roomService.leaveRoom();
  }

  isSpectatorChange(isChecked: boolean) {
    this.isSpectator = isChecked;
  }
}
