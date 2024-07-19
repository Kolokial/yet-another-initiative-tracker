import { ChangeDetectorRef, Component, ViewChild } from '@angular/core';
import { SignalingService } from './shared-services/signaling.service';
import { QrScannerService } from './components/qr-scanner/qr-scanner.service';
import { MessagingService } from './shared-services/messaging.service';
import { SocketIoConfig } from 'ngx-socket-io';
import { RoomService } from './components/room/room.service';
import { RoomComponent } from './components/room/room.component';
import { InitiativeListComponent } from './components/initiative-list/initiative-list.component';
import { InitiativeTrackerComponent } from './components/initiative-tracker/initiative-tracker.component';
import { take } from 'rxjs';
import { HasTitle } from './types/title';

//const config: SocketIoConfig = { url: 'http://192.168.0.8:3000', options: {} };
const config: SocketIoConfig = { url: 'http://localhost:3000', options: {} };

@Component({
  selector: 'app-root',
  providers: [QrScannerService],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  message!: string;
  receivedMessages: { sender: string; message: string }[] = [];
  myPeerId!: string;
  activeLink: any;

  get players(): string[] {
    return [...this.signalService.players, this.myPeerId];
  }

  public get roomUrl(): string {
    return `room/${this.messagingService.roomId}`;
  }

  private currentComponent!: HasTitle;

  public get componentTitle(): string {
    return this.currentComponent?.title;
  }

  constructor(
    private signalService: SignalingService,
    private messagingService: MessagingService,
    private roomService: RoomService,
    private qrScanner: QrScannerService,
    private ref: ChangeDetectorRef
  ) {
    // Camera.getPhoto({
    //   quality: 90,
    //   allowEditing: true,
    //   resultType: CameraResultType.Uri
    // }).then(x => {
    //   console.log(x);
    // });
  }

  startScanning() {
    this.qrScanner.startScan();
  }

  ngOnInit() {}

  onActivate(
    component: RoomComponent | InitiativeListComponent | InitiativeTrackerComponent
  ): void {
    this.currentComponent = component;
    if (component instanceof RoomComponent) {
      component.onLeaveRoom
        .pipe(take(1))
        .subscribe(() => this.signalService.disconnect());
    }
  }
}
