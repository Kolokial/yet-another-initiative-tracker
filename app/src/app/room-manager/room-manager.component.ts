import { ChangeDetectorRef, Component } from '@angular/core';
import { Envelope, MessagingService } from '../messaging.service';
import { QrScannerService } from '../qr-scanner/qr-scanner.service';
import { SignalingService } from '../signaling.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';

@Component({
  selector: 'room-manager',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './room-manager.component.html',
  styleUrl: './room-manager.component.scss'
})
export class RoomManagerComponent {

  activeLink: any;

  get players(): string[] {
    return [...this.signalService.players, this.myPeerId];
  }

  get myPeerId(): string {
    return this.messagingService.myPeerId
  }

  get roomId(): string {
    return this.messagingService.roomId;
  }

  public messageStream: Envelope[] = [];

  constructor(
    private signalService: SignalingService,
    private messagingService: MessagingService,
    private ref: ChangeDetectorRef
  ) {
    this.messagingService.messageStream.subscribe(x => {
      this.messageStream.push(x);
      this.ref.detectChanges();
    })
  }

  createRoom() {
    this.messagingService.createRoom()
  }

  joinRoom() {
    this.messagingService.joinRoom();
  }

  sendMessage(message: string) {
    this.messagingService.sendMessage(message);
  }
}