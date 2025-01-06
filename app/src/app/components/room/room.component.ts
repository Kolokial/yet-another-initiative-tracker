import { Component } from '@angular/core';

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
import { JoinRoomResponse } from 'src/app/types/messageContracts/JoinRoom/JoinRoomResponse';

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
    this._appServiceStore.isSpectator.next(value);
  }

  public get isSpectator(): boolean {
    return this._appServiceStore.isSpectator.getValue();
  }

  get myPeerId(): Observable<string> {
    return this._roomService.myPeerId;
  }

  get roomId(): Observable<string> {
    return this._roomService.roomId;
  }

  private get displayName(): string {
    return this._appServiceStore.displayName.getValue();
  }

  constructor(
    private _appServiceStore: AppServiceStore,
    private _roomService: RoomService,

    public auth: AuthService
  ) {}

  createRoom() {
    if (this.displayName.length) {
      this._roomService.createRoom().subscribe((response: JoinRoomResponse) => {
        this._appServiceStore.peerList.next(response.peerList);
      });
    }
  }

  joinRoomWithCode(roomId: string) {
    if (this.displayName.length) {
      this._roomService.joinRoom(roomId).subscribe((response: JoinRoomResponse) => {
        this._appServiceStore.peerList.next(response.peerList);
      });
    }
  }

  leaveRoom() {
    this._roomService.leaveRoom();
  }

  isSpectatorChange(isChecked: boolean) {
    this.isSpectator = isChecked;
  }
}
