import { ChangeDetectorRef, Component, Input } from '@angular/core';
import { Envelope, MessagingService } from '../messaging.service';
import { SignalingService } from '../signaling.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'room',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatInputModule,
    MatButtonModule,
    ReactiveFormsModule,
  ],
  templateUrl: './room.component.html',
  styleUrl: './room.component.scss',
})
export class RoomComponent {
  @Input()
  set roomId(id: string) {
    if ((this.roomId !== id && id) || !this.myPeerId) {
      this.messagingService.joinRoom(id);
    }
  }

  activeLink: any;

  get players(): string[] {
    return [...this.signalService.players, this.myPeerId];
  }

  get myPeerId(): string {
    return this.messagingService.myPeerId;
  }

  get roomId(): string {
    return this.messagingService.roomId;
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
    private location: Location,
    private ref: ChangeDetectorRef
  ) {
    this.messagingService.messageStream.subscribe((x) => {
      this.messageStream.push(x);
      this.ref.detectChanges();
      localStorage.setItem(
        `${this.displayName}-${this.roomId}`,
        JSON.stringify(this.messageStream)
      );
    });
  }

  createRoom() {
    this.messagingService.createRoom();
    this.updateQueryStringWithRoomId();
  }

  joinRoom() {
    this.messagingService.joinRoomWithoutId();
    this.updateQueryStringWithRoomId();
  }

  sendMessage(message: string) {
    this.messagingService.sendMessage(message);
  }

  private updateQueryStringWithRoomId() {
    //const queryParams: Params = { roomId: this.roomId }
    this.location.replaceState(`${this.roomId}`);
  }
}
