import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { Observable, Subject, combineLatest, take } from 'rxjs';
import { RoomService } from '../components/room/room.service';
import { DiceRollMessage, Envelope, ProfileUpdateMessage } from '../types/messages';

export type DataChannelEvents<T> = {
  readonly peerId: string;

  onOpen: Observable<Event>;
  onMessage: Observable<MessageEvent<Envelope<T>>>;
  onClosing: Observable<Event>;
  onClose: Observable<Event>;
  onError: Observable<Event>;
};

export type DataChannelEventsCollection = {
  ProfileChannel: DataChannelEvents<ProfileUpdateMessage>;
  DiceChannel: DataChannelEvents<DiceRollMessage>;
};

export type RTCDataChannelCollection = {
  ProfileChannel: RTCDataChannel | null;
  DiceChannel: RTCDataChannel | null;
};

type YAITCustomOffer = {
  offer: RTCSessionDescriptionInit;
  roomId: string;
  peerId: string;
};

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

  public dataChannels: { [key: string]: RTCDataChannelCollection } = {};
  private _onDataChannelAdded$ = new Subject<DataChannelEventsCollection>();
  public get onDataChannelAdded$(): Observable<DataChannelEventsCollection> {
    return this._onDataChannelAdded$.asObservable();
  }

  // public diceRollDataChannels: { [key: string]: RTCDataChannel } = {};
  // private _onDiceRollChannelAdded$ = new Subject<DataChannelEvents>();
  // public get onDiceRollChannelAdded$(): Observable<DataChannelEvents> {
  //   return this._onDiceRollChannelAdded$.asObservable();
  // }

  // private profileDataChannels: { [key: string]: RTCDataChannel } = {};
  // private _onProfileChannelAdded$ = new Subject<DataChannelEvents>();
  // public get onProfileChannelAdded$(): Observable<DataChannelEvents> {
  //   return this._onProfileChannelAdded$.asObservable();
  // }

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
      console.log('RoomJoined', data);
      this.getLatestRoomIdAndPeerId().subscribe(({ myPeerId, roomId }) => {
        this.handleNewPeerJoined(data, myPeerId, roomId);
      });
    });
    this.socket.on('offer', (data: YAITCustomOffer) => {
      console.log('offer', data);
      this.myPeerId.subscribe((myPeerId: string) => {
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
    this.setupDataChannelCollection(peerConnection, peerId, myPeerId);

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
      const channelLabel = event.channel.label;
      if (!this.dataChannels[peerId]) {
        this.dataChannels[peerId] = {
          DiceChannel: null,
          ProfileChannel: null,
        };
      }

      if (channelLabel.endsWith('diceRoll')) {
        this.dataChannels[peerId].DiceChannel = event.channel;
      }

      if (channelLabel.endsWith('profileUpdate')) {
        this.dataChannels[peerId].ProfileChannel = event.channel;
      }

      const diceChannel = this.dataChannels[peerId].DiceChannel;
      const profileChannel = this.dataChannels[peerId].ProfileChannel;
      if (diceChannel && profileChannel) {
        this._onDataChannelAdded$.next({
          DiceChannel: this.setupDataChannelEvents(diceChannel, peerId, myPeerId),
          ProfileChannel: this.setupDataChannelEvents(profileChannel, peerId, myPeerId),
        });
      }

      //this.setupDataChannel(this.dataChannels[peerId]);
      // this._onDiceRollChannelAdded$.next(
      //   this.setupDataChannelEvents(this.diceRollDataChannels[peerId], peerId, myPeerId)
      // );
      console.log(`createDataChannel called by Peer: ${peerId}`, event);
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

  private setupDataChannelCollection(
    peerConnection: RTCPeerConnection,
    peerId: string,
    myPeerId: string
  ): void {
    const diceRollLabel = this.getDataChannelLabel(peerId, myPeerId, 'diceRoll');
    const profileUpdateLabel = this.getDataChannelLabel(
      peerId,
      myPeerId,
      'profileUpdate'
    );

    const diceRollChannel = peerConnection.createDataChannel(diceRollLabel);
    const profileUpdateChannel = peerConnection.createDataChannel(profileUpdateLabel);

    this.dataChannels[peerId] = {
      DiceChannel: diceRollChannel,
      ProfileChannel: profileUpdateChannel,
    };

    this._onDataChannelAdded$.next({
      DiceChannel: this.setupDataChannelEvents(diceRollChannel, peerId, myPeerId),
      ProfileChannel: this.setupDataChannelEvents(profileUpdateChannel, peerId, myPeerId),
    });
  }

  private setupDataChannelEvents<T>(
    dataChannel: RTCDataChannel,
    peerId: string,
    myPeerId: string
  ): DataChannelEvents<T> {
    const onOpen = new Subject<Event>();
    const onMessage = new Subject<MessageEvent<Envelope<T>>>();
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
      this.dataChannels[key].ProfileChannel?.close();
      this.dataChannels[key].DiceChannel?.close();
      delete this.dataChannels[key];
    });
    Object.keys(this.peerConnections).forEach((key) => {
      this.peerConnections[key].close();
      delete this.peerConnections[key];
    });
    this.socket.disconnect();
  }

  private getDataChannelLabel(peerId: string, myPeerId: string, suffix: string): string {
    return `${peerId}-${myPeerId}-${suffix}`;
  }

  private doesDataChannelLabelMatch(
    peerId: string,
    myPeerId: string,
    label: string
  ): boolean {
    const sections = label.split('-');
    const parsedLabel = `${sections[0]}-${sections[1]}`;
    return (
      `${peerId}-${myPeerId}` === parsedLabel || `${myPeerId}-${peerId}` === parsedLabel
    );
  }

  private getLatestRoomIdAndPeerId(): Observable<{ myPeerId: string; roomId: string }> {
    return combineLatest({ myPeerId: this.myPeerId, roomId: this.roomId }).pipe(take(1));
  }
}
