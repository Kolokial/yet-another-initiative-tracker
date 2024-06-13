import { ChangeDetectorRef, Component, Input } from '@angular/core';
import { Envelope, MessagingService } from '../messaging.service';
import { SignalingService } from '../signaling.service';
import { FormsModule } from '@angular/forms';
import { CommonModule, Location } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { RoomService } from './room.service';
import { ROOM_ID } from '../constants';

@Component({
  selector: 'room',
  standalone: true,
  imports: [CommonModule, FormsModule, MatInputModule, MatButtonModule],
  templateUrl: './room.component.html',
  styleUrl: './room.component.scss',
})
export class RoomComponent {
  @Input()
  set roomId(id: string) {
    if ((this.roomId !== id && id) || !this.myPeerId) {
      this.roomService.joinRoom(id);
    }
  }

  activeLink: any;

  get players(): string[] {
    return [...this.signalService.players, this.myPeerId];
  }

  get myPeerId(): string {
    return this.roomService.myPeerId;
  }

  get roomId(): string {
    return this.roomService.roomId;
  }

  get displayName(): string {
    return this.messagingService.displayName;
  }

  set displayName(displayName: string) {
    this.messagingService.displayName = displayName;
  }

  public messageStream: Envelope[] = [];

  constructor(
    private signalService: SignalingService,
    private messagingService: MessagingService,
    private roomService: RoomService,
    private location: Location,
    private ref: ChangeDetectorRef
  ) {}

  createRoom() {
    if (this.displayName.length) {
      this.roomService.createRoom();
      this.updateQueryStringWithRoomId();
    }
  }

  joinRoom() {
    if (this.displayName.length) {
      this.roomService.joinRoomWithoutId();
      this.updateQueryStringWithRoomId();
    }
  }

  sendMessage(message: string) {
    this.messagingService.sendMessage(message);
  }

  private updateQueryStringWithRoomId() {
    //const queryParams: Params = { roomId: this.roomId }
    this.location.replaceState(`room`);
    localStorage.setItem(ROOM_ID, this.roomId);
  }
}
