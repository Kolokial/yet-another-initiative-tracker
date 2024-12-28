import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { environment } from 'src/environments/environment';
import { AppServiceStore } from '../app.service.store';
import {
  BehaviorSubject,
  first,
  flatMap,
  from,
  map,
  mergeMap,
  Observable,
  of,
  Subject,
  switchMap,
} from 'rxjs';
import { Envelope, JoinRoomMessage, LeaveRoomMessage, Peer } from '../types/Messages';
import { AuthService, IdToken } from '@auth0/auth0-angular';

@Injectable({
  providedIn: 'root',
})
export class SignalRService {
  private _hubConnection: signalR.HubConnection;
  constructor(
    private appStore: AppServiceStore,
    private auth: AuthService
  ) {
    this._hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(`${environment.apiUrl}/chathub`)
      .build();

    this._hubConnection.on('ReceiveMessage', (user, message) => {
      console.log(`User: ${user}, Message: ${message}`);
    });

    this._hubConnection.start().catch((err) => console.error(err));

    this.setupEventHubMethods();
  }

  public joinRoom(roomName: string): Observable<Peer[]> {
    return this.auth.idTokenClaims$.pipe(
      first(),
      switchMap((idTokenClaim: IdToken | null | undefined) => {
        if (!idTokenClaim) {
          return of();
        }
        return this.invoke<JoinRoomMessage, Peer[]>(
          'JoinRoom',
          idTokenClaim['sub'] as string,
          {
            roomName: roomName,
            peer: {
              auth0Id: idTokenClaim['sub'],
              characterName: this.appStore.selectedCharacter.value?.characterName,
              diceRoll: 9,
              displayName: this.appStore.displayName.value,
            },
          }
        );
      })
    );
  }

  public leaveRoom(roomName: string): Observable<void> {
    return this.auth.idTokenClaims$.pipe(
      first(),
      switchMap((idTokenClaim: IdToken | null | undefined) => {
        if (!idTokenClaim) {
          return of();
        }
        return this.invoke<LeaveRoomMessage, void>(
          'LeaveRoom',
          idTokenClaim['sub'] as string,
          {
            roomName: roomName,
          }
        );
      })
    );
  }

  private invoke<T, O>(method: string, peerId: string, message: T): Observable<O> {
    const envelope: Envelope<T> = {
      auth0Id: peerId,
      message: message,
      dateStamp: new Date(),
    };
    const promise = this._hubConnection.invoke(method, envelope);
    promise.catch(console.error);
    return from(promise);
  }

  private setupEventHubMethods(): void {
    this._hubConnection.on('DisplayNameUpdate', this.displayNameUpdated);
  }

  private displayNameUpdated(displayName: string, peerId: string): void {
    const user = this.appStore.initativeList.find((x) => x.peerId === peerId);

    if (user) {
      user.displayName = of(displayName);
    }
  }
}
