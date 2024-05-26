import { ElementRef, Injectable } from '@angular/core';
import { SignalingService } from './signaling.service';

@Injectable({
  providedIn: 'root',
})
export class CallService {
  configuration: RTCConfiguration = {
    iceServers: [
      {
        urls: [
          'stun:stun1.l.google.com:19302',
          'stun:stun2.l.google.com:19302',
        ],
      },
    ],
    iceCandidatePoolSize: 10,
  };

  connection!: RTCPeerConnection;

  constructor(private signalingService: SignalingService) {}

  private async _initConnection(remoteVideo: ElementRef): Promise<void> {
    this.connection = new RTCPeerConnection(this.configuration);

    //await this._getStreams(remoteVideo);

    this.createDataChannel();

    this._registerConnectionListeners();
  }

  private createDataChannel(): void {
    const dc = this.connection.createDataChannel('ChatChannel', {negotiated: true, id:0});
    
    dc.onopen = ()  => console.log('opened');
    dc.onmessage = e => console.log(`message: ${e}`);
    this.connection.oniceconnectionstatechange = e => console.log(e);
  }

  public async createOffer(remoteVideo: ElementRef): Promise<void> {
    await this._initConnection(remoteVideo);

    const offer = await this.connection.createOffer();

    await this.connection.setLocalDescription(offer);

    const conn = this.connection;

    this.connection.onicecandidate = ({candidate}) => {
        if(candidate){
            return;
        }
        
        console.log(`Offer: ${conn?.localDescription?.sdp}`);
    }

    //this.signalingService.sendMessage({ type: 'offer', offer });
  }

  public async handleOffer(
    offer: RTCSessionDescription,
    remoteVideo: ElementRef
  ): Promise<void> {
    await this._initConnection(remoteVideo);

    await this.connection.setRemoteDescription(
      new RTCSessionDescription(offer)
    );

    const answer = await this.connection.createAnswer();

    await this.connection.setLocalDescription(answer);

    this.signalingService.sendMessage({ type: 'answer', answer });
  }

  public async handleAnswer(answer: RTCSessionDescription): Promise<void> {
    await this.connection.setRemoteDescription(
      new RTCSessionDescription(answer)
    );
  }

  public async handleCandidate(candidate: RTCIceCandidate): Promise<void> {
    if (candidate) {
      await this.connection.addIceCandidate(new RTCIceCandidate(candidate));
    }
  }

  private _registerConnectionListeners(): void {
    this.connection.onicegatheringstatechange = (ev: Event) => {
      console.log(
        `ICE gathering state changed: ${this.connection.iceGatheringState}`
      );
    };

    this.connection.onconnectionstatechange = () => {
      console.log(
        `Connection state change: ${this.connection.connectionState}`
      );
    };

    this.connection.onsignalingstatechange = () => {
      console.log(`Signaling state change: ${this.connection.signalingState}`);
    };

    this.connection.oniceconnectionstatechange = () => {
      console.log(
        `ICE connection state change: ${this.connection.iceConnectionState}`
      );
    };
    this.connection.onicecandidate = (event) => {
      if (event.candidate) {
        const payload = {
          type: 'candidate',
          candidate: event.candidate.toJSON(),
        };
        this.signalingService.sendMessage(payload);
      }
    };
  }

  private async _getStreams(remoteVideo: ElementRef): Promise<void> {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    const remoteStream = new MediaStream();

    remoteVideo.nativeElement.srcObject = remoteStream;

    this.connection.ontrack = (event) => {
      event.streams[0].getTracks().forEach((track) => {
        remoteStream.addTrack(track);
      });
    };

    stream.getTracks().forEach((track) => {
      this.connection.addTrack(track, stream);
    });
  }
}