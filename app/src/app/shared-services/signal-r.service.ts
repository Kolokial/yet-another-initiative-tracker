import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { environment } from 'src/environments/environment';
import { AppServiceStore } from '../app.service.store';
import { first, from, Observable, of, Subject, switchMap } from 'rxjs';
import {
  Envelope,
  JoinRoomMessage,
  LeaveRoomMessage,
  Peer,
  UpdateDisplayNameRequest,
} from '../types/Messages';
import { AuthService, IdToken } from '@auth0/auth0-angular';

@Injectable({
  providedIn: 'root',
})
export class SignalRService {
  public onPeerJoined$: Subject<void> = new Subject<void>();
  public onDisplayNameUpdated$: Subject<void> = new Subject<void>();

  private _hubConnection: signalR.HubConnection;
  constructor(
    private appStore: AppServiceStore,
    private auth: AuthService
  ) {
    this._hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(`${environment.apiUrl}/chathub`)
      .build();

    // this._hubConnection.on('ReceiveMessage', (user, message) => {
    //   console.log(`User: ${user}, Message: ${message}`);
    // });

    this._hubConnection.start().catch((err) => console.error(err));

    this.setupEventHubMethods();
  }

  private setupEventHubMethods(): void {
    this._hubConnection.on('PeerJoined', this.onPeerJoined$.next);
    this._hubConnection.on('DisplayNameUpdated', this.onDisplayNameUpdated$.next);
  }

  public joinRoom(roomName: string): Observable<Peer[]> {
    return this.invoke<JoinRoomMessage, Peer[]>('JoinRoom', {
      roomName: roomName,
      peer: {
        characterName: this.appStore.selectedCharacter.value?.characterName,
        diceRoll: 9,
        displayName: this.appStore.displayName.value,
      },
    });
  }

  public leaveRoom(roomName: string): Observable<void> {
    return this.invoke<LeaveRoomMessage, void>('LeaveRoom', {
      roomName: roomName,
    });
  }

  public updateDisplayName(displayName: string) {
    return this.invoke<UpdateDisplayNameRequest, void>('UpdateDisplayName', {
      displayName: displayName,
    });
  }

  private invoke<T, O>(method: string, message: T): Observable<O> {
    return this.auth.idTokenClaims$.pipe(
      first(),
      switchMap((idTokenClaim: IdToken | null | undefined) => {
        if (!idTokenClaim) {
          return of();
        }
        const envelope: Envelope<T> = {
          auth0Id: idTokenClaim['sub'],
          message: message,
          dateStamp: new Date(),
        };
        const promise = this._hubConnection.invoke(method, envelope);
        promise.catch(console.error);
        return from(promise);
      })
    );
  }

  private displayNameUpdated(displayName: string, peerId: string): void {
    const user = this.appStore.initativeList.find((x) => x.peerId === peerId);

    if (user) {
      user.displayName = of(displayName);
    }
  }
}
