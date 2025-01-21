/* Housekeeping! */
import { Injectable } from '@angular/core';
import { ROOM_ID } from '../../constants';
import { BehaviorSubject, first, Observable, throwError } from 'rxjs';
import { AuthService } from '@auth0/auth0-angular';
import { SignalRService } from 'src/app/shared-services/signal-r.service';
import { JoinRoomResponse } from 'src/app/types/messageContracts/JoinRoom/JoinRoomResponse';
import { UserType } from 'src/app/types/formGroups/JoinRoom.FormGroup';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root',
})
export class RoomService {
  public roomId: BehaviorSubject<string> = new BehaviorSubject<string>('');

  private _myPeerId: BehaviorSubject<string> = new BehaviorSubject<string>('');
  public get myPeerId(): Observable<string> {
    return this._myPeerId.asObservable();
  }

  constructor(
    private auth0: AuthService,
    private signalR: SignalRService,
    private _snackBar: MatSnackBar
  ) {
    this.attemptToAutoJoinRoom();

    this.setupOnPeerJoinedSnackBar();
    this.setupOnPeerLeftSnackBar();
  }

  private attemptToAutoJoinRoom() {
    this.auth0.isAuthenticated$.subscribe((isAuthenticated) => {
      if (isAuthenticated) {
        const url = new URL(window.location.href);
        let roomId = url.searchParams.get(ROOM_ID);
        if (!roomId) {
          console.log('checking localStorage');
          roomId = localStorage.getItem(ROOM_ID);
        }

        if (roomId != null) {
          //this.joinRoom(roomId);
        }
      }
    });
  }

  public joinRoom(roomId: string, userType: UserType): Observable<JoinRoomResponse> {
    if (!roomId) {
      return throwError(() => new Error('No Room ID supplied.'));
    } else {
      return this.signalR.joinRoom(roomId, userType);
    }
  }

  public leaveRoom() {
    this.signalR
      .leaveRoom(this.roomId.value)
      .pipe(first())
      .subscribe(() => {
        this.roomId.next('');
        this._myPeerId.next('');

        localStorage.removeItem(ROOM_ID);
      });
  }

  private setupOnPeerJoinedSnackBar() {
    this.signalR.onRoomJoined$.subscribe((peer) => {
      this.auth0.idTokenClaims$.pipe(first()).subscribe((idToken) => {
        if (!idToken) {
          return;
        }

        if (idToken['sub'] !== peer.auth0Id) {
          this._snackBar.open(`${peer.displayName} has joined!`, 'X', {
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
}
