/* Housekeeping! */
import { Injectable } from '@angular/core';
import { SignalingService } from '../signaling.service';

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

  private roomHistory: Map<string, string> = new Map<string, string>();

  constructor(private signalingService: SignalingService) {}

  createRoom() {
    this._roomId = Math.random().toString(36).substring(7);
    this.signalingService.joinRoom(this.roomId).subscribe((peerId: string) => {
      this._myPeerId = peerId;
    });
    alert(`Room created with ID: ${this.roomId}`);
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

  private updateRoomHistory(): void {
    /* Todo: add room history functionality */
    //this.roomHistory.set(this.)
    //localStorage.setItem('RoomId', JSON.stringify());
  }
}
