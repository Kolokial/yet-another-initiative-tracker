import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { Observable, Subject, take } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';

export type DataChannelEvents = {
  readonly peerId: string;

  onOpen: Observable<Event>;
  onMessage: Observable<MessageEvent>;
  onClosing: Observable<Event>;
  onClose: Observable<Event>;
  onError: Observable<Event>;
};

@Injectable({
  providedIn: 'root',
})
export class SignalingService {
  private _myPeerId!: string;
  public get myPeerId(): string {
    return this._myPeerId;
  }
  private roomId!: string;

  public peerConnections: { [key: string]: RTCPeerConnection } = {};
  public dataChannels: { [key: string]: RTCDataChannel } = {};
  public dataChannelEvents$ = new Subject<DataChannelEvents>();
  private dataChannelEvents: DataChannelEvents[] = [];

  private _dataChannelClosingSubject = new Subject<string>();
  public get dataChannelClosing$(): Observable<string> {
    return this._dataChannelClosingSubject.asObservable();
  }

  public get players(): string[] {
    return Object.keys(this.peerConnections);
  }

  constructor(
    private socket: Socket,
    private snackbar: MatSnackBar
  ) {
    this.socket.on('roomJoined', (data: any) => this.handleNewPeerJoined(data));
    this.socket.on('offer', (data: any) => this.handleOffer(data));
    this.socket.on('answer', (data: any) => this.handleAnswer(data));
    this.socket.on('candidate', (data: any) => this.handleCandidate(data));
  }

  public joinRoom(roomId: string): Observable<string> {
    const subject = new Subject<string>();

    if (!roomId) {
      subject.complete();
    } else {
      const intervalId = setInterval(() => {
        if (this.socket.ioSocket.connected) {
          subject.next(this.emitJoinRoom(roomId));
          clearInterval(intervalId);
        }
      }, 500);
    }

    return subject.pipe(take(1));
  }

  public leaveRoom() {
    this.roomId = '';
    this._myPeerId = '';
    Object.keys(this.dataChannels).forEach((key) => {
      this.dataChannels[key].close();
      delete this.dataChannels[key];
    });
    Object.keys(this.peerConnections).forEach((key) => {
      this.peerConnections[key].close();
      delete this.peerConnections[key];
    });
  }

  private emitJoinRoom(roomId: string): string {
    this.roomId = roomId;
    const data = this.socket.emit('joinRoom', roomId);
    return (this._myPeerId = data.id);
  }

  private createPeerConnection(peerId: string) {
    console.log('Creating PeerConnection with', peerId);
    const peerConnection = new RTCPeerConnection();

    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        this.socket.emit('candidate', {
          roomId: this.roomId,
          candidate: event.candidate,
          target: this._myPeerId,
        });
      }
    };

    peerConnection.ondatachannel = (event) => {
      this.dataChannels[peerId] = event.channel;

      //this.setupDataChannel(this.dataChannels[peerId]);
      this.dataChannelEvents$.next(
        this.setupDataChannelEvents(this.dataChannels[peerId], peerId)
      );
      console.log(`createDataChannel called by Peer: ${peerId}`);
    };

    return peerConnection;
  }

  private handleNewPeerJoined(peerList: string) {
    console.log(peerList);

    JSON.parse(peerList).forEach((peer: string) => {
      if (peer != this._myPeerId) {
        this.createOffer(peer);
      }
    });
  }

  private createOffer(peerId: string) {
    this.peerConnections[peerId] = this.createPeerConnection(peerId);

    const peerConnection = this.peerConnections[peerId];
    this.setupDataChannel(peerConnection, peerId);

    peerConnection
      .createOffer()
      .then((offer) => {
        return peerConnection.setLocalDescription(offer);
      })
      .then(() => {
        this.socket.emit('offer', {
          roomId: this.roomId,
          offer: peerConnection.localDescription,
          peerId: this._myPeerId,
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
          source: this._myPeerId,
        });
      });
  }

  private handleAnswer(data: any) {
    const peerId = data.source;
    const answer = data.answer;
    const peerConnection = this.peerConnections[peerId];
    if (peerConnection.signalingState !== 'stable' && this._myPeerId === data.target) {
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

  private setupDataChannel(peerConnection: RTCPeerConnection, peerId: string): void {
    const dataChannelLabel = this.getDataChannelLabel(peerId);
    this.dataChannels[peerId] = peerConnection.createDataChannel(dataChannelLabel);
    const dataChannel = this.dataChannels[peerId];

    const events = this.setupDataChannelEvents(dataChannel, peerId);
    this.dataChannelEvents.push(events);
    this.dataChannelEvents$.next(events);
  }

  private setupDataChannelEvents(
    dataChannel: RTCDataChannel,
    peerId: string
  ): DataChannelEvents {
    const onOpen: Subject<Event> = new Subject<Event>();
    const onMessage: Subject<MessageEvent> = new Subject<MessageEvent>();
    const onClosing: Subject<Event> = new Subject<Event>();
    const onClose: Subject<Event> = new Subject<Event>();
    const onError: Subject<Event> = new Subject<Event>();
    dataChannel.onopen = (event: Event) => {
      onOpen.next(event);
    };

    dataChannel.onmessage = (event: MessageEvent) => {
      onMessage.next(event);
    };

    /* TODO Possibly use subjects so other parts of system can make use of these events. */
    dataChannel.onclosing = (event: Event) => {
      onClosing.next(event);
      const dataChannel = event.currentTarget as RTCDataChannel;
      console.log(`onclosing event for: ${dataChannel.label} `, event);
    };
    dataChannel.onclose = (event: Event) => {
      onClose.next(event);
      console.log('onclose event', event);
      console.log('Count before');
      console.log(`PeerConnections Count: ${Object.keys(this.peerConnections).length}`);
      console.log(`DataChannels Count: ${Object.keys(this.dataChannels).length}`);
      Object.keys(this.peerConnections).forEach((peerId) => {
        const dataChannel = event.currentTarget as RTCDataChannel;
        if (this.doesDataChannelLabelMatch(peerId, dataChannel.label)) {
          delete this.peerConnections[peerId];
          delete this.dataChannels[peerId];
          this._dataChannelClosingSubject.next(peerId);
        }
      });
      console.log('Count after');
      console.log(`PeerConnections Count: ${Object.keys(this.peerConnections).length}`);
      console.log(`DataChannels Count: ${Object.keys(this.dataChannels).length}`);
    };

    dataChannel.onerror = (event: Event) => {
      onError.next(event);
      console.log('There was an error', event);
    };

    return {
      peerId: peerId,
      onOpen: onOpen.asObservable(),
      onMessage: onMessage.asObservable(),
      onClosing: onClosing.asObservable(),
      onClose: onClose.asObservable(),
      onError: onError.asObservable(),
    };
  }

  private getDataChannelLabel(peerId: string): string {
    return `${peerId}-${this._myPeerId}`;
  }

  private doesDataChannelLabelMatch(peerId: string, label: string): boolean {
    return (
      `${peerId}-${this._myPeerId}` === label || `${this._myPeerId}-${peerId}` === label
    );
  }
}
