import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { Observable, Subject } from 'rxjs';
import { Envelope } from './messaging.service';

@Injectable({
  providedIn: 'root',
})
export class SignalingService {
  private myPeerId!: string;
  private roomId!: string;

  public peerConnections: { [key: string]: RTCPeerConnection } = {};
  public dataChannels: { [key: string]: RTCDataChannel } = {};
  public dataChannelSubject = new Subject<RTCDataChannel>();

  public get players(): string[] {
    return Object.keys(this.peerConnections);
  }

  constructor(private socket: Socket) {
    this.socket.on('roomJoined', (data: any) => this.handleNewPeerJoined(data));
    this.socket.on('offer', (data: any) => this.handleOffer(data));
    this.socket.on('answer', (data: any) => this.handleAnswer(data));
    this.socket.on('candidate', (data: any) => this.handleCandidate(data));
  }

  public joinRoom(roomId: string): Observable<string> {
    const subject = new Subject<string>();

    const intervalId = setInterval(() => {
      if (this.socket.ioSocket.connected) {
        subject.next(this.emitJoinRoom(roomId));
        clearInterval(intervalId);
      }
    }, 500);

    return subject;
  }

  private emitJoinRoom(roomId: string): string {
    this.roomId = roomId;
    const data = this.socket.emit('joinRoom', roomId);
    return (this.myPeerId = data.id);
  }

  private createPeerConnection(peerId: string) {
    console.log('Creating PeerConnection with', peerId);
    const peerConnection = new RTCPeerConnection();

    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        this.socket.emit('candidate', {
          roomId: this.roomId,
          candidate: event.candidate,
          target: this.myPeerId,
        });
      }
    };

    peerConnection.ondatachannel = (event) => {
      this.dataChannels[peerId] = event.channel;
      this.dataChannelSubject.next(this.dataChannels[peerId]);
      //this.setupDataChannel(this.dataChannels[peerId]);
      this.setupDataChannelClosingEvent(this.dataChannels[peerId]);
      console.log(`createDataChannel called by Peer: ${peerId}`);
    };

    return peerConnection;
  }

  private handleNewPeerJoined(peerList: string) {
    console.log(peerList);

    JSON.parse(peerList).forEach((peer: string) => {
      if (peer != this.myPeerId) {
        this.createOffer(peer);
      }
    });
  }

  private createOffer(peerId: string) {
    this.peerConnections[peerId] = this.createPeerConnection(peerId);

    const peerConnection = this.peerConnections[peerId];
    const dataChannelLabel = this.getDataChannelLabel(peerId);
    this.dataChannels[peerId] = peerConnection.createDataChannel(dataChannelLabel);
    const dataChannel = this.dataChannels[peerId];

    this.setupDataChannelClosingEvent(dataChannel);
    this.dataChannelSubject.next(dataChannel);

    peerConnection
      .createOffer()
      .then((offer) => {
        return peerConnection.setLocalDescription(offer);
      })
      .then(() => {
        this.socket.emit('offer', {
          roomId: this.roomId,
          offer: peerConnection.localDescription,
          peerId: this.myPeerId,
        });
      })
      .catch((e) => console.error('Error creating offer:', e));
  }

  private handleOffer(data: any) {
    const peerId = data.peerId;
    const offer = data.offer;
    localStorage.setItem(peerId, JSON.stringify(offer));
    if (!this.peerConnections[peerId]) {
      this.peerConnections[peerId] = this.createPeerConnection(peerId);
    }

    const peerConnection = this.peerConnections[peerId];
    if (peerConnection.connectionState !== 'new') {
      return;
    }

    peerConnection
      .setRemoteDescription(new RTCSessionDescription(offer))
      .then(() => {
        return peerConnection.createAnswer();
      })
      .then((answer) => {
        return peerConnection.setLocalDescription(answer);
      })
      .then(() => {
        this.socket.emit('answer', {
          roomId: data.roomId,
          answer: peerConnection.localDescription,
          target: peerId,
          source: this.myPeerId,
        });
      });
  }

  private handleAnswer(data: any) {
    const peerId = data.source;
    const answer = data.answer;
    const peerConnection = this.peerConnections[peerId];
    if (peerConnection.signalingState !== 'stable' && this.myPeerId === data.target) {
      peerConnection.setRemoteDescription(new RTCSessionDescription(answer)).then(() => {
        peerConnection.addIceCandidate();
      });
    }
  }

  private handleCandidate(data: any) {
    const candidate = new RTCIceCandidate(data.candidate);
    const peerId = data.target;
    this.peerConnections[peerId].addIceCandidate(candidate);
  }

  private setupDataChannelClosingEvent(dataChannel: RTCDataChannel): void {
    /* TODO Possibly use subjects so other parts of system can make use of these events. */
    dataChannel.onclosing = (event: Event) => {
      const dataChannel = event.currentTarget as RTCDataChannel;
      console.log(`onclosing event for: ${dataChannel.label} `, event);
    };
    dataChannel.onclose = (event: Event) => {
      console.log('onclose event', event);
      console.log('Count before');
      console.log(`PeerConnections Count: ${Object.keys(this.peerConnections).length}`);
      console.log(`DataChannels Count: ${Object.keys(this.dataChannels).length}`);
      Object.keys(this.peerConnections).forEach((peerId) => {
        const dataChannel = event.currentTarget as RTCDataChannel;
        if (this.doesDataChannelLabelMatch(peerId, dataChannel.label)) {
          delete this.peerConnections[peerId];
          delete this.dataChannels[peerId];
        }
      });
      console.log('Count after');
      console.log(`PeerConnections Count: ${Object.keys(this.peerConnections).length}`);
      console.log(`DataChannels Count: ${Object.keys(this.dataChannels).length}`);
    };

    dataChannel.onerror = (event: Event) => {
      console.log('There was an error', event);
    };
  }

  private getDataChannelLabel(peerId: string): string {
    return `${peerId}-${this.myPeerId}`;
  }

  private doesDataChannelLabelMatch(peerId: string, label: string): boolean {
    return (
      `${peerId}-${this.myPeerId}` === label || `${this.myPeerId}-${peerId}` === label
    );
  }
}
