/* Housekeeping! */
import { Injectable } from '@angular/core';
import { ROOM_INFO } from '../../constants';
import { BehaviorSubject, first, Observable, throwError } from 'rxjs';
import { AuthService } from '@auth0/auth0-angular';
import { SignalRService } from 'src/app/shared-services/signal-r.service';
import { JoinRoomResponse } from 'src/app/types/messageContracts/joinRoom/JoinRoomResponse';
import { UserType } from 'src/app/types/formGroups/JoinRoom.FormGroup';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Character } from 'src/app/types/messageContracts/Character';
import { Router } from '@angular/router';
import { AppServiceStore } from 'src/app/app.service.store';

@Injectable({
  providedIn: 'root',
})
export class RoomService {
  public roomId: BehaviorSubject<string> = new BehaviorSubject<string>('');
  public userType: UserType = 'player';

  private _myPeerId: BehaviorSubject<string> = new BehaviorSubject<string>('');
  public get myPeerId(): Observable<string> {
    return this._myPeerId.asObservable();
  }

  constructor(
    private auth0: AuthService,
    private signalR: SignalRService,
    private _snackBar: MatSnackBar,
    private _router: Router,
    private _appServiceStore: AppServiceStore
  ) {
    this.attemptToAutoJoinRoom();

    this.setupOnPeerJoinedSnackBar();
    this.setupOnPeerLeftSnackBar();
  }

  private attemptToAutoJoinRoom() {
    this.auth0.isAuthenticated$.subscribe((isAuthenticated) => {
      if (isAuthenticated) {
        const roomInfoItem = localStorage.getItem(ROOM_INFO);
        if (roomInfoItem == null) {
          return;
        }

        const roomInfo = JSON.parse(roomInfoItem);
        if (roomInfo == null) {
          return;
        }

        if (this._router.url !== '/room') {
          this._router.navigate(['/room']);
        }
        this.userType = roomInfo.userType;
        this.joinRoom(roomInfo.roomId, roomInfo.userType, roomInfo.characters);
      }
    });
  }

  public joinRoom(roomId: string, userType: UserType, characters: Character[]): void {
    this.signalR
      .joinRoom(roomId, userType, characters)
      .subscribe((joinRoomResponse) =>
        this.handleJoinRoomReponse(joinRoomResponse, roomId)
      );
  }

  public leaveRoom() {
    this.signalR
      .leaveRoom(this.roomId.value)
      .pipe(first())
      .subscribe(() => {
        this.roomId.next('');
        this._myPeerId.next('');
        localStorage.removeItem(ROOM_INFO);
      });
  }

  private setupOnPeerJoinedSnackBar() {
    this.signalR.onRoomJoined$.subscribe((peer) => {
      this.auth0.idTokenClaims$.pipe(first()).subscribe((idToken) => {
        if (!idToken) {
          return;
        }

        const emoji = peer.isDungeonMaster ? '🎲' : '⚔';
        if (idToken['sub'] !== peer.auth0Id) {
          this._snackBar.open(`${emoji} ${peer.displayName} has joined!`, '❌', {
            duration: 3000,
          });
        }
      });
    });
  }

  public setupOnPeerLeftSnackBar() {
    this.signalR.onRoomLeft$.subscribe((peer) => {
      this.auth0.idTokenClaims$.pipe(first()).subscribe((idToken) => {
        if (!idToken) {
          return;
        }

        if (idToken['sub'] !== peer.auth0Id) {
          this._snackBar.open(`${peer.displayName} has left!`, 'X', {
            duration: 3000,
          });
        }
      });
    });
  }

  private handleJoinRoomReponse(joinRoomResponse: JoinRoomResponse, roomId: string) {
    if (joinRoomResponse?.errorMessage) {
      this._snackBar.open(joinRoomResponse.errorMessage);
    } else {
      this._appServiceStore.peerList.next(joinRoomResponse.peerList);
      const characters = joinRoomResponse.peerList.flatMap((peer) => peer.characters);
      this._appServiceStore.charactersInRoom.next(characters);

      this.roomId.next(roomId);
      localStorage.setItem(
        ROOM_INFO,
        JSON.stringify({
          roomId: roomId,
          userType: this.userType,
          characters: characters,
        })
      );
    }
  }
}
