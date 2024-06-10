import { ChangeDetectorRef, Component } from '@angular/core';
import { SignalingService } from './signaling.service';
import { QrScannerService } from './qr-scanner/qr-scanner.service';
import { MessagingService } from './messaging.service';
import { SocketIoConfig } from 'ngx-socket-io';

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

  constructor(
    private signalService: SignalingService,
    private messagingService: MessagingService,
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

    this.messagingService.messageStream.subscribe((x) => {
      this.ref.detectChanges();
    });
  }

  startScanning() {
    this.qrScanner.startScan();
  }

  ngOnInit() {
    if (!this.messagingService.myPeerId) {
      this.signalService.joinRoom(this.messagingService.roomId);
    }
  }
}
