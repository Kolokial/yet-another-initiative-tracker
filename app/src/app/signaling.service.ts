import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SignalingService {
  private myPeerId!: string;
  public peerConnections: { [key: string]: RTCPeerConnection } = {};
  public dataChannels: { [key: string]: RTCDataChannel } = {};
  dataChannelSubject = new Subject<RTCDataChannel>();
  private roomId!: string;

  constructor(private socket: Socket) {
    this.socket.on('newPeerJoined', (peerId: any) => this.handleNewPeerJoined(peerId));
    this.socket.on('offer', (data: any) => this.handleOffer(data));
    this.socket.on('answer', (data: any) => this.handleAnswer(data));
    this.socket.on('candidate', (data: any) => this.handleCandidate(data));
  }

  joinRoom(roomId: string): string {
    this.roomId = roomId;
    const data = this.socket.emit('joinRoom', roomId);
    return this.myPeerId = data.id;    
    console.log(data);
  }

  private createPeerConnection(peerId: string) {
    console.log('Creating PeerConnection with', peerId);
    const peerConnection = new RTCPeerConnection();

    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        this.socket.emit('candidate', { roomId: this.roomId, candidate: event.candidate, target: this.myPeerId });
      }
    };

    peerConnection.ondatachannel = (event) => {
      this.dataChannels[peerId] = event.channel;
      this.dataChannelSubject.next(this.dataChannels[peerId]);
      //this.setupDataChannel(this.dataChannels[peerId]);
      console.log('ondatachannel');
    };

    return peerConnection
  }

  private handleNewPeerJoined(peerId: string) {
    this.peerConnections[peerId] = this.createPeerConnection(peerId);
    const peerConnection = this.peerConnections[peerId]
    this.dataChannels[peerId] = peerConnection.createDataChannel('dataChannel');
    //this.setupDataChannel(this.dataChannels[peerId], peerId);
    this.dataChannelSubject.next(this.dataChannels[peerId]);

    peerConnection.createOffer().then((offer) => {
      return peerConnection.setLocalDescription(offer);
    }).then(() => {
      this.socket.emit('offer', { roomId: this.roomId, offer: peerConnection.localDescription, peerId: this.myPeerId});
    }).catch(e => console.error('Error creating offer:', e));
  }

  private handleOffer(data: any) {
    const peerId = data.peerId;
    const offer = data.offer;
    if (!this.peerConnections[peerId]) {
      this.peerConnections[peerId] = this.createPeerConnection(peerId);
    }

    const peerConnection = this.peerConnections[peerId];
    if(peerConnection.connectionState !== 'new'){
      return;
    }

    peerConnection.setRemoteDescription(new RTCSessionDescription(offer)).then(() => {
      return peerConnection.createAnswer()
    }).then( answer => {
      return peerConnection.setLocalDescription(answer);
    }).then(()=> {
      this.socket.emit('answer', { roomId: data.roomId, answer: peerConnection.localDescription, target: peerId, source: this.myPeerId });
    });
  }

  private handleAnswer(data: any) {
    const peerId = data.source;
    const answer = data.answer;
    const peerConnection = this.peerConnections[peerId];
    if(peerConnection.signalingState !== 'stable' && this.myPeerId === data.target){
      peerConnection.setRemoteDescription(new RTCSessionDescription(answer)).then(() => {
        peerConnection.addIceCandidate()
      });
    }    
  }

  private handleCandidate(data: any) {
    const candidate = new RTCIceCandidate(data.candidate);
    const peerId = data.target;
    this.peerConnections[peerId].addIceCandidate(candidate);
  }

  private addIceCandidate(peerConnection: RTCPeerConnection, candidate: RTCIceCandidate): void{
    peerConnection.addIceCandidate(candidate).catch(console.error)
  }
}
