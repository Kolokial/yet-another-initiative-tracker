/* Housekeeping! */
import { Injectable } from '@angular/core';
import { ROOM_ID } from '../../constants';
import { BehaviorSubject, Observable, Subject, take } from 'rxjs';
import { Socket } from 'ngx-socket-io';
import { Location } from '@angular/common';
import { AppServiceStore } from 'src/app/app.service.store';
import { Auth0ClientFactory, AuthService } from '@auth0/auth0-angular';

@Injectable({
  providedIn: 'root',
})
export class RoomService {
  private _roomId: BehaviorSubject<string> = new BehaviorSubject<string>('');
  public get roomId(): Observable<string> {
    return this._roomId.asObservable();
  }

  private _myPeerId: BehaviorSubject<string> = new BehaviorSubject<string>('');
  public get myPeerId(): Observable<string> {
    return this._myPeerId.asObservable();
  }

  private joinRoomSuccess$!: Observable<string>;
  constructor(
    private location: Location,
    private socket: Socket,
    private auth0: AuthService
  ) {
    this.auth0.isAuthenticated$.subscribe((isAuthenticated) => {
      if (isAuthenticated) {
        this.attemptToAutoJoinRoom();
      }
    });
  }

  private attemptToAutoJoinRoom() {
    const url = new URL(window.location.href);
    let roomId = url.searchParams.get(ROOM_ID);
    console.log('checking url');
    if (!roomId) {
      console.log('checking localStorage');
      roomId = localStorage.getItem(ROOM_ID);
    }

    if (roomId != null) {
      this.joinRoom(roomId);
    }
  }

  private joinRoom(roomId: string): Observable<string> {
    const subject = new Subject<string>();

    if (!roomId) {
      subject.complete();
    } else {
      const intervalId = setInterval(() => {
        if (this.socket.ioSocket.connected) {
          subject.next(this.emitJoinRoom(roomId));
          clearInterval(intervalId);
        } else {
          this.socket.connect();
        }
      }, 500);
    }

    return subject.pipe(take(1));
  }

  private emitJoinRoom(roomId: string): string {
    this._roomId.next(roomId);
    const data = this.socket.emit('joinRoom', roomId);
    this._myPeerId.next(data.id);
    return data.id;
  }

  public leaveRoom() {
    this._roomId.next('');
    this._myPeerId.next('');
    localStorage.removeItem(ROOM_ID);
    // this.signalingService.disconnect();
  }

  createRoom() {
    const roomId = Math.random().toString(36).substring(7);
    this.location.replaceState(`room`);
    this.joinRoom(roomId).subscribe((peerId: string) => {
      this._myPeerId.next(peerId);
    });
    //alert(`Room created with ID: ${this.roomId}`);
  }

  joinRoomWithId(roomId: string) {
    if (roomId) {
      localStorage.setItem(ROOM_ID, roomId);
      this.joinRoomSuccess$ = this.joinRoom(roomId);
      this.joinRoomSuccess$.subscribe((peerId: string) => {
        this._myPeerId.next(peerId);
      });
    }
  }

  joinRoomWithoutId() {
    const roomId = prompt('Enter the room ID to join:');
    if (roomId) {
      localStorage.setItem(ROOM_ID, roomId);
      this.location.replaceState(`room`);
      this.joinRoom(roomId).subscribe((peerId) => {
        this._myPeerId.next(peerId);
      });
    }
  }

  private updateRoomHistory(): void {
    /* Todo: add room history functionality */
    //this.roomHistory.set(this.)
    //localStorage.setItem(ROOM_ID, JSON.stringify());
  }
}
