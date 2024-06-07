import { ChangeDetectorRef, Component } from '@angular/core'
import { SignalingService } from './signaling.service'
import { QrScannerService } from './qr-scanner/qr-scanner.service'
import { MessagingService } from './messaging.service'
import { SocketIoConfig } from 'ngx-socket-io'

//const config: SocketIoConfig = { url: 'http://192.168.0.8:3000', options: {} };
const config: SocketIoConfig = { url: 'http://localhost:3000', options: {} }

@Component({
    selector: 'app-root',
    providers: [QrScannerService],
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
})
export class AppComponent {
    roomId!: string
    message!: string
    receivedMessages: { sender: string; message: string }[] = []
    myPeerId!: string
    activeLink: any

    get players(): string[] {
        return [...this.signalService.players, this.myPeerId]
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
            this.ref.detectChanges()
        })
    }

    startScanning() {
        this.qrScanner.startScan()
    }

    createRoom() {
        this.messagingService.createRoom()
        // this.roomId = Math.random().toString(36).substring(7);
        // this.myPeerId = this.signalingService.joinRoom(this.roomId);
        // alert(`Room created with ID: ${this.roomId}`);
    }

    joinRoom() {
        this.messagingService.joinRoom()
        // const roomId = prompt('Enter the room ID to join:');
        // if (roomId) {
        //   this.roomId = roomId;
        //   this.myPeerId = this.signalingService.joinRoom(this.roomId);
        // }
    }

    sendMessage() {
        this.messagingService.sendMessage(this.message)
        // for (const peerId of Object.keys(this.signalingService.peerConnections)) {
        //   const dataChannel = this.signalingService.dataChannels[peerId];
        //   if (dataChannel && dataChannel.readyState === 'open') {
        //     const message = {
        //       sender: this.myPeerId,
        //       message: this.message,
        //     };
        //     this.receivedMessages.push(message);
        //     dataChannel.send(JSON.stringify(message));
        //   }
        // }
        // this.message = '';
    }

    // private setupDataChannel(dataChannel: RTCDataChannel) {
    //   dataChannel.onopen = () => {
    //     console.log('Data channel open');
    //   };

    //   dataChannel.onclosing = (event: Event) => {
    //     console.log('Data channel has begun to close', event);
    //   };

    //   dataChannel.onclose = () => {
    //     console.log('Data channel  has closed');
    //   };

    //   dataChannel.onerror = (event: Event) => {
    //     console.log('There was an error', event);
    //   };

    //   dataChannel.onmessage = (event: MessageEvent) => {
    //     if (event.data.sender !== this.myPeerId) {
    //       this.receivedMessages.push(JSON.parse(event.data));
    //       this.ref.detectChanges();

    //       console.log('Data channel message:', event.data);
    //     }
    //   };
    // }
}
