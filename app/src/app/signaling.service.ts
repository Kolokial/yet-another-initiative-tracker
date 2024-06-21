import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { BehaviorSubject, Observable, Subject, combineLatest, take } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RoomService } from './room/room.service';
import { AppServiceStore } from './app.service.store';

export type DataChannelEvents = {
  readonly peerId: string;

  onOpen: Observable<Event>;
  onMessage: Observable<MessageEvent>;
  onClosing: Observable<Event>;
  onClose: Observable<Event>;
  onError: Observable<Event>;
};

type YAITCustomOffer = {
  offer: RTCSessionDescriptionInit;
  roomId: string;
  peerId: string;
}

@Injectable({
  providedIn: 'root',
})
export class SignalingService {
  public get myPeerId(): Observable<string> {
    return this.roomService.myPeerId.pipe(take(1));
  }

  public get roomId(): Observable<string> {
    return this.roomService.roomId.pipe(take(1));
  }

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
    private roomService: RoomService
  ) {
    this.socket.on('roomJoined', (data: string[]) => {
      console.log('ROomJoined',data);
      this.getLatestRoomIdAndPeerId().subscribe(({ myPeerId, roomId }) => {
        this.handleNewPeerJoined(data, myPeerId, roomId);
      });
    });
    this.socket.on('offer', (data: YAITCustomOffer) => {
      console.log('offer',data)
      this.myPeerId.subscribe((myPeerId:string) => {
        this.handleOffer(data, myPeerId, data.roomId);
      });
    });
    this.socket.on('answer', (data: any) => this.handleAnswer(data));
    this.socket.on('candidate', (data: any) => this.handleCandidate(data));
  }

  private handleNewPeerJoined(peerList: string[], myPeerId: string, roomId: string) {
    console.log(peerList);

    peerList.forEach((peer: string) => {
      if (peer != myPeerId) {
        this.createOffer(peer, myPeerId, roomId);
      }
    });
  }

  private createOffer(peerId: string, myPeerId: string, roomId: string) {
    this.peerConnections[peerId] = this.createPeerConnection(peerId, myPeerId, roomId);

    const peerConnection = this.peerConnections[peerId];
    this.setupDataChannel(peerConnection, peerId, myPeerId);

    peerConnection
      .createOffer()
      .then((offer) => {
        return peerConnection.setLocalDescription(offer);
      })
      .then(() => {
        this.socket.emit('offer', {
          roomId: roomId,
          offer: peerConnection.localDescription,
          peerId: myPeerId,
        });
      })
      .catch((e) => console.error('Error creating offer:', e));
  }

  private createPeerConnection(peerId: string, myPeerId: string, roomId: string) {
    console.log('Creating PeerConnection with', peerId);
    const peerConnection = new RTCPeerConnection();

    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        this.socket.emit('candidate', {
          roomId: roomId,
          candidate: event.candidate,
          target: myPeerId,
        });
      }
    };

    peerConnection.ondatachannel = (event) => {
      this.dataChannels[peerId] = event.channel;

      //this.setupDataChannel(this.dataChannels[peerId]);
      this.dataChannelEvents$.next(
        this.setupDataChannelEvents(this.dataChannels[peerId], peerId, myPeerId)
      );
      console.log(`createDataChannel called by Peer: ${peerId}`);
    };

    return peerConnection;
  }

  private handleOffer(data: any, myPeerId: string, roomId: string) {
    const peerId = data.peerId;
    const offer = data.offer;
    localStorage.setItem(peerId, JSON.stringify(offer));
    if (!this.peerConnections[peerId]) {
      this.peerConnections[peerId] = this.createPeerConnection(peerId, myPeerId, roomId);
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
        this.myPeerId.subscribe((myPeerId) => {
          this.socket.emit('answer', {
            roomId: data.roomId,
            answer: peerConnection.localDescription,
            target: peerId,
            source: myPeerId,
          });
        });
      });
  }

  private handleAnswer(data: any) {
    const peerId = data.source;
    const answer = data.answer;
    const peerConnection = this.peerConnections[peerId];
    this.myPeerId.subscribe((myPeerId) => {
      if (peerConnection.signalingState !== 'stable' && myPeerId === data.target) {
        peerConnection
          .setRemoteDescription(new RTCSessionDescription(answer))
          .then(() => {
            peerConnection.addIceCandidate();
          });
      }
    });
  }

  private handleCandidate(data: any) {
    const candidate = new RTCIceCandidate(data.candidate);
    const peerId = data.target;
    this.peerConnections[peerId].addIceCandidate(candidate);
  }

  private setupDataChannel(
    peerConnection: RTCPeerConnection,
    peerId: string,
    myPeerId: string
  ): void {
    const dataChannelLabel = this.getDataChannelLabel(peerId, myPeerId);
    this.dataChannels[peerId] = peerConnection.createDataChannel(dataChannelLabel);
    const dataChannel = this.dataChannels[peerId];

    const events = this.setupDataChannelEvents(dataChannel, peerId, myPeerId);
    this.dataChannelEvents.push(events);
    this.dataChannelEvents$.next(events);
  }

  private setupDataChannelEvents(
    dataChannel: RTCDataChannel,
    peerId: string,
    myPeerId: string
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
        if (this.doesDataChannelLabelMatch(peerId, myPeerId, dataChannel.label)) {
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

  public disconnect(): void {
    Object.keys(this.dataChannels).forEach((key) => {
      this.dataChannels[key].close();
      delete this.dataChannels[key];
    });
    Object.keys(this.peerConnections).forEach((key) => {
      this.peerConnections[key].close();
      delete this.peerConnections[key];
    });
    this.socket.disconnect();
  }

  private getDataChannelLabel(peerId: string, myPeerId: string): string {
    return `${peerId}-${myPeerId}`;
  }

  private doesDataChannelLabelMatch(
    peerId: string,
    myPeerId: string,
    label: string
  ): boolean {
    return `${peerId}-${myPeerId}` === label || `${myPeerId}-${peerId}` === label;
  }

  private getLatestRoomIdAndPeerId(): Observable<{ myPeerId: string; roomId: string }> {
    return combineLatest({ myPeerId: this.myPeerId, roomId: this.roomId }).pipe(take(1));
  }
}
