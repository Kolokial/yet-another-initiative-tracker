import { ChangeDetectorRef, Component } from '@angular/core';
import { SignalingService } from './signaling.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  roomId!: string;
  message!: string;
  receivedMessages: {sender: string, message: string}[] = [];
  myPeerId!: string;

  constructor(private signalingService: SignalingService,   private ref: ChangeDetectorRef,) {
    this.signalingService.dataChannelSubject.subscribe((dataChannel) => {
      if (dataChannel) {
        this.setupDataChannel(dataChannel);
      }
    });
  }

  createRoom() {
    this.roomId = Math.random().toString(36).substring(7);
    this.myPeerId = this.signalingService.joinRoom(this.roomId);
    alert(`Room created with ID: ${this.roomId}`);
  }

  joinRoom() {
    const roomId = prompt('Enter the room ID to join:');
    if (roomId) {
      this.roomId = roomId;
      this.myPeerId = this.signalingService.joinRoom(this.roomId);
    }
  }

  sendMessage() {
    for (const peerId of Object.keys(this.signalingService.peerConnections)) {
      const dataChannel = this.signalingService.dataChannels[peerId];
      if (dataChannel && dataChannel.readyState === 'open') {
        const message = {
          sender: this.myPeerId,
          message: this.message
        };
        this.receivedMessages.push(message);
        dataChannel.send(JSON.stringify(message));
      }
    }
    this.message = '';
  }

  private setupDataChannel(dataChannel: RTCDataChannel) {
    dataChannel.onopen = () => { 
      console.log('Data channel open')
    };
    dataChannel.onclose = () => { 
      console.log('Data channel closed')
    };
    dataChannel.onmessage = (event) => {
      
      this.receivedMessages.push(JSON.parse(event.data));
      this.ref.detectChanges();
      console.log('Data channel message:', event.data)
    };
  }
}
