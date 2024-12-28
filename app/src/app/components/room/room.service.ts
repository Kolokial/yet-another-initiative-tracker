/* Housekeeping! */
import { Injectable } from '@angular/core';
import { PEER_ID_SEPERATOR, ROOM_ID } from '../../constants';
import { BehaviorSubject, first, Observable, Subject, throwError } from 'rxjs';
import { Socket } from 'ngx-socket-io';
import { Location } from '@angular/common';
import { AuthService, IdToken } from '@auth0/auth0-angular';
import { RoomData } from 'src/app/types/RoomInfo';
import { Peer } from 'src/app/types/Messages';
import {
  DataChannelCollection,
  RTCDataChannelCollection,
} from 'src/app/types/DataChannels';
import { environment } from 'src/environments/environment';
import { SignalRService } from 'src/app/shared-services/signal-r.service';

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
    private auth0: AuthService,
    private signalR: SignalRService
  ) {
    this.attemptToAutoJoinRoom();
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

  public joinRoom(roomId: string): Observable<Peer[]> {
    if (!roomId) {
      return throwError(() => new Error('No Room ID supplied.'));
    } else {
      this._roomId.next(roomId);
      return this.signalR.joinRoom(roomId);
    }
  }

  leaveRoom() {
    this.signalR
      .leaveRoom(this._roomId.value)
      .pipe(first())
      .subscribe(() => {
        this._roomId.next('');
        this._myPeerId.next('');

        localStorage.removeItem(ROOM_ID);
      });
  }

  createRoom() {
    const roomId = Math.random().toString(36).substring(7);
    this.location.replaceState(`room`);
    return this.joinRoom(roomId);
  }
}
