import { Component, inject } from '@angular/core';
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
import { JoinRoomResponse } from 'src/app/types/messageContracts/joinRoom/JoinRoomResponse';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { UserType } from 'src/app/types/formGroups/JoinRoom.FormGroup';
import { DmToolsComponent } from '../dm-tools/dm-tools.component';
import { MatTabsModule } from '@angular/material/tabs';
import { CharacterManagerComponent } from '../character-manager/character-manager.component';
import { MatIconModule } from '@angular/material/icon';
import { ROOM_INFO } from 'src/app/constants';

@Component({
  selector: 'room',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSlideToggleModule,
    InitiativeListComponent,
    MatButtonToggleModule,
    MatTabsModule,
    DmToolsComponent,
    CharacterManagerComponent,
  ],
  templateUrl: './room.component.html',
  styleUrl: './room.component.scss',
})
export class RoomComponent implements HasTitle {
  activeLink: any;
  readonly title: string = 'Room Manager';
  public roomCode: string = '';

  public get userType(): UserType {
    return this._roomService.userType;
  }

  public set userType(value: UserType) {
    this._roomService.userType = value;
  }

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

  private _snackBar = inject(MatSnackBar);

  constructor(
    private _appServiceStore: AppServiceStore,
    private _roomService: RoomService,

    public auth: AuthService
  ) {}

  createRoom() {
    if (this.displayName.length) {
      const roomId = Math.random().toString(36).substring(7);
      const characters = this._appServiceStore.convertPlayerCharacterToCharacter();
      this._roomService.joinRoom(roomId, this.userType, characters);
    }
  }

  joinRoom(roomId: string, userType: UserType) {
    if (this.displayName.length && roomId !== null && roomId.length > 0) {
      var characters = this._appServiceStore.convertPlayerCharacterToCharacter();
      this._roomService.joinRoom(roomId, userType, characters);
    }
  }

  leaveRoom() {
    const length = this._appServiceStore.selectedCharacter.value.length;
    this._appServiceStore.selectedCharacter.value.splice(1, length - 1);
    this._roomService.leaveRoom();
  }

  isSpectatorChange(isChecked: boolean) {
    this.isSpectator = isChecked;
  }
}
