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
import { Peer } from 'src/app/types/Messages';

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
  @Output() onJoinRoom: EventEmitter<Peer[]> = new EventEmitter<Peer[]>();

  activeLink: any;
  readonly title: string = 'Room Manager';
  public roomCode: string = '';

  public set isSpectator(value: boolean) {
    this.appServiceStore.isSpectator.next(value);
  }

  public get isSpectator(): boolean {
    return this.appServiceStore.isSpectator.getValue();
  }

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
      this.roomService.createRoom().subscribe((peerList: Peer[]) => {
        this.onJoinRoom.emit(peerList);
      });
    }
  }

  joinRoom(roomId: string) {
    if (this.displayName.length) {
      this.roomService.joinRoom(roomId).subscribe((roomData: Peer[]) => {
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

  isSpectatorChange(isChecked: boolean) {
    this.isSpectator = isChecked;
  }
}
