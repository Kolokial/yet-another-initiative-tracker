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
import { JoinRoomResponse } from 'src/app/types/messageContracts/JoinRoom/JoinRoomResponse';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { UserType } from 'src/app/types/formGroups/JoinRoom.FormGroup';
import { DmToolsComponent } from '../dm-tools/dm-tools.component';
import { MatTabsModule } from '@angular/material/tabs';

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
    MatButtonToggleModule,
    MatTabsModule,
    DmToolsComponent,
  ],
  templateUrl: './room.component.html',
  styleUrl: './room.component.scss',
})
export class RoomComponent implements HasTitle {
  activeLink: any;
  readonly title: string = 'Room Manager';
  public roomCode: string = '';
  public userType: UserType = 'player';

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
      this._roomService
        .joinRoom(roomId, this.userType)
        .subscribe((response: JoinRoomResponse) => {
          this.handleJoinRoomReponse(response, roomId);
        });
    }
  }

  joinRoom(roomId: string, userType: UserType) {
    if (this.displayName.length && roomId !== null && roomId.length > 0) {
      this._roomService
        .joinRoom(roomId, userType)
        .subscribe((response: JoinRoomResponse) => {
          this.handleJoinRoomReponse(response, roomId);
        });
    }
  }

  leaveRoom() {
    this._roomService.leaveRoom();
  }

  isSpectatorChange(isChecked: boolean) {
    this.isSpectator = isChecked;
  }

  private handleJoinRoomReponse(joinRoomResponse: JoinRoomResponse, roomId: string) {
    if (joinRoomResponse?.errorMessage) {
      this._snackBar.open(joinRoomResponse.errorMessage);
    } else {
      this._roomService.roomId.next(roomId);
      this._appServiceStore.peerList.next(joinRoomResponse.peerList);
    }
  }
}
