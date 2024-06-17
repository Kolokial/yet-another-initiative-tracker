/* Housekeeping! */
import { Injectable } from '@angular/core';
import { SignalingService } from '../signaling.service';
import { ROOM_ID } from '../constants';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class RoomService {
  private _roomId: string = '';
  public get roomId(): string {
    return this._roomId;
  }

  private _myPeerId: string = '';
  public get myPeerId(): string {
    return this._myPeerId;
  }

  private joinRoomSuccess$!: Observable<string>;
  constructor(
    private signalingService: SignalingService
  ) {
    this.attemptToAutoJoinRoom();
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

  createRoom() {
    this._roomId = Math.random().toString(36).substring(7);
    this.signalingService.joinRoom(this.roomId).subscribe((peerId) => {
      this._myPeerId = peerId;
    });
    //alert(`Room created with ID: ${this.roomId}`);
  }

  joinRoom(roomId: string) {
    if (roomId) {
      this._roomId = roomId;
      localStorage.setItem(ROOM_ID, roomId);
      this.joinRoomSuccess$ = this.signalingService.joinRoom(this.roomId)
      this.joinRoomSuccess$.subscribe((peerId) => {
        this._myPeerId = peerId;
      });
    }
  }

  leaveRoom() {
    this.signalingService.leaveRoom();
  }

  joinRoomWithoutId() {
    const roomId = prompt('Enter the room ID to join:');
    if (roomId) {
      this._roomId = roomId;
      this.signalingService.joinRoom(this.roomId).subscribe((peerId) => {
        this._myPeerId = peerId;
      });
    }
  }

  private updateRoomHistory(): void {
    /* Todo: add room history functionality */
    //this.roomHistory.set(this.)
    //localStorage.setItem('RoomId', JSON.stringify());
  }
}
