import { Component, EventEmitter, Output } from '@angular/core';
import { MessagingService } from '../../shared-services/messaging.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { RoomService } from './room.service';
import { Observable } from 'rxjs';
import { AuthService } from '@auth0/auth0-angular';
import { HasTitle } from '../../types/Title';
import { AppServiceStore } from 'src/app/app.service.store';
import { RoomData } from 'src/app/types/RoomInfo';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

@Component({
  selector: 'room',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatInputModule,
    MatButtonModule,
    MatSlideToggleModule,
  ],
  templateUrl: './room.component.html',
  styleUrl: './room.component.scss',
})
export class RoomComponent implements HasTitle {
  // @Input()
  // set roomId(id: string) {
  //   combineLatest([this.roomId, this.myPeerId])
  //     .pipe(take(1))
  //     .subscribe({
  //       next: ([roomId, myPeerId]) => {
  //         if ((roomId !== id && id) || !myPeerId) {
  //           this.roomService.joinRoomWithId(id);
  //         }
  //       },
  //     });
  // }

  @Output() onLeaveRoom: EventEmitter<void> = new EventEmitter<void>();
  @Output() onJoinRoom: EventEmitter<RoomData> = new EventEmitter<RoomData>();

  activeLink: any;
  readonly title: string = 'Room Manager';
  public roomCode: string = '';

  get myPeerId(): Observable<string> {
    return this.roomService.myPeerId;
  }

  get roomId(): Observable<string> {
    return this.roomService.roomId;
  }

  private get displayName(): string {
    return this.appServiceStore.displayName.getValue();
  }

  constructor(
    private appServiceStore: AppServiceStore,
    private messagingService: MessagingService,
    private roomService: RoomService,

    public auth: AuthService
  ) {}

  createRoom() {
    if (this.displayName.length) {
      this.roomService.createRoom().subscribe((roomData: RoomData) => {
        this.onJoinRoom.emit(roomData);
      });
    }
  }

  joinRoom(roomId: string) {
    if (this.displayName.length) {
      this.roomService.joinRoom(roomId).subscribe((roomData: RoomData) => {
        this.onJoinRoom.emit(roomData);
      });
    }
  }

  leaveRoom() {
    this.onLeaveRoom.emit();
    this.roomService.leaveRoom();
  }

  sendMessage(message: number | string) {
    this.messagingService.sendDiceRollMessage(message as number);
  }
}
