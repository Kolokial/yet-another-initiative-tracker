/* Housekeeping! */
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class RoomService {
  private _roomId: string = '';
  private _myPeerId: string = '';
  private signalingService: any;

  constructor() { }

  createRoom() {
    this._roomId = Math.random().toString(36).substring(7);
    this.signalingService.joinRoom(this.roomId).subscribe((peerId: string) => {
      this._myPeerId = peerId;
    });
    alert(`Room created with ID: ${this.roomId}`);
  }
  roomId(roomId: any) {
    throw new Error('Method not implemented.');
  }

  joinRoom(roomId: string) {
    if (roomId) {
      this._roomId = roomId;
      this.signalingService.joinRoom(this.roomId).subscribe((peerId: string) => {
        this._myPeerId = peerId;
      });
    }
  }

  joinRoomWithoutId() {
    const roomId = prompt('Enter the room ID to join:');
    if (roomId) {
      this._roomId = roomId;
      this.signalingService.joinRoom(this.roomId).subscribe((peerId: string) => {
        this._myPeerId = peerId;
      });
    }
  }
}
