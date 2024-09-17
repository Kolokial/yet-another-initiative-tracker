/* Housekeeping! */
import { Injectable } from '@angular/core';
import { PEER_ID_SEPERATOR, ROOM_ID } from '../../constants';
import {
  BehaviorSubject,
  combineLatest,
  Observable,
  ReplaySubject,
  Subject,
  take,
} from 'rxjs';
import { Socket } from 'ngx-socket-io';
import { Location } from '@angular/common';
import { AuthService } from '@auth0/auth0-angular';
import { RoomData } from 'src/app/types/RoomInfo';

import { Envelope, PeerId } from 'src/app/types/Messages';
import {
  DataChannelCollection,
  DataChannelEventsTraffic,
  DataChannelInboundEvents,
  DataChannelOutboundEvents,
  RTCDataChannelCollection,
  YAITCustomOffer,
} from 'src/app/types/DataChannels';

@Injectable({
  providedIn: 'root',
})
export class RoomService {
  public peerConnections: { [key: string]: RTCPeerConnection } = {};

  private dataChannels: { [peerId: string]: RTCDataChannelCollection } = {};
  public dataChannelCollections: { [peerId: string]: DataChannelCollection } = {};
  private _onDataChannelAdded$ = new Subject<DataChannelCollection>();
  public get onDataChannelAdded$(): Observable<DataChannelCollection> {
    return this._onDataChannelAdded$.asObservable();
  }

  private _roomId: BehaviorSubject<string> = new BehaviorSubject<string>('');
  public get roomId(): Observable<string> {
    return this._roomId.asObservable();
  }

  private _myPeerId: BehaviorSubject<string> = new BehaviorSubject<string>('');
  public get myPeerId(): Observable<string> {
    return this._myPeerId.asObservable();
  }

  constructor(
    private location: Location,
    private socket: Socket,
    private auth0: AuthService
  ) {
    this.attemptToAutoJoinRoom();
    this.setupSocketEvents();
  }

  private attemptToAutoJoinRoom() {
    this.auth0.isAuthenticated$.subscribe((isAuthenticated) => {
      if (isAuthenticated) {
        const url = new URL(window.location.href);
        let roomId = url.searchParams.get(ROOM_ID);
        if (!roomId) {
          console.log('checking localStorage');
          roomId = localStorage.getItem(ROOM_ID);
        }

        if (roomId != null) {
          this.joinRoom(roomId);
        }
      }
    });
  }

  public joinRoom(roomId: string): Observable<RoomData> {
    const subject = new Subject<RoomData>();

    if (!roomId) {
      subject.complete();
    } else {
      const intervalId = setInterval(() => {
        if (this.socket.ioSocket.connected) {
          subject.next({
            myPeerId: this.emitJoinRoom(roomId),
            roomId: roomId,
          });
          clearInterval(intervalId);
        } else {
          this.socket.connect();
        }
      }, 500);
    }

    return subject.pipe(take(1));
  }

  private emitJoinRoom(roomId: string): string {
    this._roomId.next(roomId);
    const data = this.socket.emit('joinRoom', roomId);
    this._myPeerId.next(data.id);
    return data.id;
  }

  leaveRoom() {
    this._roomId.next('');
    this._myPeerId.next('');
    localStorage.removeItem(ROOM_ID);
    this.disconnectDataChannels();
    this.socket.disconnect();
  }

  private disconnectDataChannels(): void {
    Object.keys(this.dataChannels).forEach((peerId) => {
      this.dataChannels[peerId].DiceChannel?.close();
      this.dataChannels[peerId].ProfileChannel?.close();
      delete this.dataChannels[peerId];
    });
  }

  createRoom() {
    const roomId = Math.random().toString(36).substring(7);
    this.location.replaceState(`room`);
    return this.joinRoom(roomId);
  }

  private setupSocketEvents(): void {
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

  private getLatestRoomIdAndPeerId(): Observable<RoomData> {
    return combineLatest({ myPeerId: this.myPeerId, roomId: this.roomId }).pipe(take(1));
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
        this.dataChannelCollections[peerId] = {
          PeerId: peerId,
          DiceChannel: this.setupDataChannelEventsTraffic(diceChannel, myPeerId, peerId),
          ProfileChannel: this.setupDataChannelEventsTraffic(
            profileChannel,
            myPeerId,
            peerId
          ),
        };
        this._onDataChannelAdded$.next(this.dataChannelCollections[peerId]);
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
    if (!peerConnection) {
      return;
    }
    this.myPeerId.pipe(take(1)).subscribe((myPeerId) => {
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

    const diceChannel = peerConnection.createDataChannel(diceRollLabel);
    const profileChannel = peerConnection.createDataChannel(profileUpdateLabel);

    this.dataChannels[peerId] = {
      DiceChannel: diceChannel,
      ProfileChannel: profileChannel,
    };

    this.dataChannelCollections[peerId] = {
      PeerId: peerId,
      DiceChannel: this.setupDataChannelEventsTraffic(diceChannel, myPeerId, peerId),
      ProfileChannel: this.setupDataChannelEventsTraffic(
        profileChannel,
        myPeerId,
        peerId
      ),
    };
    this._onDataChannelAdded$.next(this.dataChannelCollections[peerId]);
  }

  private setupDataChannelEventsTraffic<T>(
    newDataChannel: RTCDataChannel,
    myPeerId: PeerId,
    peerId: PeerId
  ): DataChannelEventsTraffic<T> {
    return {
      InboundEvents: this.setupDataChannelInboundEvents(newDataChannel, myPeerId, peerId),
      OutboundEvents: this.setupDataChannelOutboundEvents(newDataChannel),
    };
  }

  private setupDataChannelInboundEvents<T>(
    dataChannel: RTCDataChannel,
    myPeerId: string,
    peerId: string
  ): DataChannelInboundEvents<T> {
    const onOpen = new Subject<Event>();
    const onMessage = new ReplaySubject<Envelope<T>>(1);
    const onClosing: Subject<Event> = new Subject<Event>();
    const onClose: Subject<PeerId> = new Subject<PeerId>();
    const onError: Subject<Event> = new Subject<Event>();
    dataChannel.onopen = (event: Event) => {
      console.log('dataChannelOpen', event);
      onOpen.next(event);
    };

    dataChannel.onmessage = (event: MessageEvent) => {
      onMessage.next(JSON.parse(event.data));
    };

    /* TODO Possibly use subjects so other parts of system can make use of these events. */
    dataChannel.onclosing = (event: Event) => {
      onClosing.next(event);
      const dataChannel = event.currentTarget as RTCDataChannel;
      console.log(`onclosing event for: ${dataChannel.label} `, event);
    };
    dataChannel.onclose = (event: Event) => {
      onClose.next(peerId);
      console.log('onclose event', event);
      console.log('Count before');
      console.log(`PeerConnections Count: ${Object.keys(this.peerConnections).length}`);
      console.log(`DataChannels Count: ${Object.keys(this.dataChannels).length}`);
      Object.keys(this.peerConnections).forEach((peerId) => {
        const dataChannel = event.currentTarget as RTCDataChannel;
        if (this.doesDataChannelLabelMatch(peerId, myPeerId, dataChannel.label)) {
          delete this.peerConnections[peerId];
          delete this.dataChannels[peerId];
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
      onOpen: onOpen.asObservable(),
      onMessage: onMessage.asObservable(),
      onClosing: onClosing.asObservable(),
      onClose: onClose.asObservable(),
      onError: onError.asObservable(),
    };
  }

  private setupDataChannelOutboundEvents<T>(
    newDataChannel: RTCDataChannel
  ): DataChannelOutboundEvents<T> {
    const sendSubject = new ReplaySubject<Envelope<T>>(1);

    sendSubject.subscribe((envelope) => {
      newDataChannel.send(JSON.stringify(envelope));
    });

    const outboundEvent: DataChannelOutboundEvents<T> = {
      sendMessage: (message: Envelope<T>) => sendSubject.next(message),
    };

    return outboundEvent;
  }

  private getDataChannelLabel(peerId: string, myPeerId: string, suffix: string): string {
    return `${peerId}${PEER_ID_SEPERATOR}${myPeerId}${PEER_ID_SEPERATOR}${suffix}`;
  }

  private doesDataChannelLabelMatch(
    peerId: string,
    myPeerId: string,
    label: string
  ): boolean {
    const sections = label.split(`${PEER_ID_SEPERATOR}`);
    const parsedLabel = `${sections[0]}${PEER_ID_SEPERATOR}${sections[1]}`;
    return (
      `${peerId}${PEER_ID_SEPERATOR}${myPeerId}` === parsedLabel ||
      `${myPeerId}${PEER_ID_SEPERATOR}${peerId}` === parsedLabel
    );
  }
}
