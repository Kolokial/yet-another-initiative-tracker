import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { environment } from 'src/environments/environment';
import { AppServiceStore } from '../app.service.store';
import { first, from, Observable, of, Subject, switchMap } from 'rxjs';

import { AuthService, IdToken } from '@auth0/auth0-angular';
import { InitiativeListComponent } from '../components/initiative-list/initiative-list.component';
import { Peer } from '../types/messageContracts/Peer';
import { Broadcast } from '../types/messageContracts/Broadcast';
import { Envelope } from '../types/messageContracts/Envelope';
import { TurnFinishedBroadcast } from '../types/messageContracts/finishTurn/TurnFinishedBroadcast';
import { JoinRoomRequest } from '../types/messageContracts/JoinRoom/JoinRoomRequest';
import { LeaveRoomRequest } from '../types/messageContracts/leaveRoom/LeaveRoomRequest';
import { RollDiceRequest } from '../types/messageContracts/rollDice/RollDiceRequest';
import { UpdateDisplayNameBroadcast } from '../types/messageContracts/updateDisplayName/DisplayNameUpdatedBroadcast';
import { UpdateDisplayNameRequest } from '../types/messageContracts/updateDisplayName/UpdateDisplayNameRequest';
import { RoomLeftBroadcast } from '../types/messageContracts/leaveRoom/RoomLeftBroadcast';
import { RoomJoinedBroadcast } from '../types/messageContracts/JoinRoom/RoomJoinedBroadcast';
import { FinishTurnRequest } from '../types/messageContracts/finishTurn/FinishTurnRequest';
import { DiceRolledBroadcast } from '../types/messageContracts/rollDice/DiceRolledBroadcast';

@Injectable({
  providedIn: 'root',
})
export class SignalRService {
  private _onPeerJoined$ = new Subject<Peer>();
  public get onPeerJoined$(): Observable<Peer> {
    return this._onPeerJoined$.asObservable();
  }

  private _onPeerLeft$ = new Subject<string>();
  public get onPeerLeft$(): Observable<string> {
    return this._onPeerLeft$.asObservable();
  }

  private _onDisplayNameUpdated$ = new Subject<void>();
  public get onDisplayNameUpdated$(): Observable<void> {
    return this._onDisplayNameUpdated$.asObservable();
  }

  private _onDiceRolled$ = new Subject<DiceRolledBroadcast>();
  public get onDiceRolled$(): Observable<DiceRolledBroadcast> {
    return this._onDiceRolled$.asObservable();
  }

  private _onTurnFinished$ = new Subject<string>();
  public get onTurnFinished$(): Observable<string> {
    return this._onTurnFinished$.asObservable();
  }

  private _hubConnection: signalR.HubConnection;
  constructor(
    private appStore: AppServiceStore,
    private auth: AuthService
  ) {
    this._hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(`${environment.apiUrl}/chathub`)
      .withAutomaticReconnect()
      .withKeepAliveInterval(5000)
      .build();

    // this._hubConnection.on('ReceiveMessage', (user, message) => {
    //   console.log(`User: ${user}, Message: ${message}`);
    // });
    this.startConnection();
  }

  private startConnection(): void {
    this._hubConnection
      .start()
      .then((fulfilled) => {
        console.assert(
          this._hubConnection.state === signalR.HubConnectionState.Connected
        );
        console.log('SignalR Connected.', fulfilled);
        this.setupEventHubMethods();
      })
      .catch((reason) => {
        console.assert(
          this._hubConnection.state === signalR.HubConnectionState.Disconnected
        );
        console.log(reason);
        setTimeout(() => this.startConnection(), 5000);
      });
  }

  private setupEventHubMethods(): void {
    this._hubConnection.on('RoomJoined', (broadcastMsg: RoomJoinedBroadcast) =>
      this.onPeerJoined(broadcastMsg)
    );
    this._hubConnection.on('PeerLeft', (broadcastMsg: RoomLeftBroadcast) =>
      this.onPeerLeft(broadcastMsg)
    );
    this._hubConnection.on('DisplayNameUpdated', this._onDisplayNameUpdated$.next);
    this._hubConnection.on('DiceRolled', (broadcastMsg: DiceRolledBroadcast) =>
      this.onDiceRolled(broadcastMsg)
    );
    this._hubConnection.on('TurnFinished', (broadcastMsg: TurnFinishedBroadcast) =>
      this.onTurnFinished(broadcastMsg)
    );
  }

  public joinRoom(roomName: string): Observable<Peer[]> {
    return this.invoke<JoinRoomRequest, Peer[]>('JoinRoom', {
      roomName: roomName,
      characterName: this.appStore.selectedCharacter.value?.characterName,
      diceRoll: this.appStore.lastSentRoll,
      displayName: this.appStore.displayName.value,
    });
  }

  public leaveRoom(roomName: string): Observable<void> {
    return this.invoke<LeaveRoomRequest, void>('LeaveRoom', {
      roomName: roomName,
    });
  }

  public updateDisplayName(displayName: string): Observable<void> {
    return this.invoke<UpdateDisplayNameRequest, void>('UpdateDisplayName', {
      displayName: displayName,
    });
  }

  public finishTurn(): Observable<void> {
    return this.invoke<FinishTurnRequest, void>('FinishTurn', { test: '' });
  }

  public rollDice(diceRoll: number): Observable<void> {
    return this.invoke<RollDiceRequest, void>('RollDice', { diceRoll: diceRoll });
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

  private onPeerJoined(broadcastMessage: RoomJoinedBroadcast): void {
    this.auth.idTokenClaims$.pipe(first()).subscribe((idTokenClaim) => {
      if (idTokenClaim && idTokenClaim['sub'] !== broadcastMessage.auth0Id) {
        this._onPeerJoined$.next(broadcastMessage.peer);
        console.log('Peer Joined: ', broadcastMessage);
      }
    });
  }

  private onPeerLeft(broadcastMessage: RoomLeftBroadcast): void {
    this.doAuthCheck(broadcastMessage, () => {
      this._onPeerLeft$.next(broadcastMessage.auth0Id);
      console.log('Peer Left: ', broadcastMessage);
    });
  }

  private onDiceRolled(broadcastMsg: DiceRolledBroadcast): void {
    this.doAuthCheck(broadcastMsg, () => {
      this._onDiceRolled$.next(broadcastMsg);
    });
  }

  private onDisplayNameUpdated(broadcastMessage: UpdateDisplayNameBroadcast): void {}

  private onTurnFinished(broadcastMsg: TurnFinishedBroadcast): void {
    this.doAuthCheck(broadcastMsg, () => {
      this._onTurnFinished$.next(broadcastMsg.auth0Id);
    });
    console.log(broadcastMsg.auth0Id, 'finished their turn.');
  }

  private doAuthCheck(broadcastMessage: Broadcast, callback: () => void): void {
    this.auth.idTokenClaims$.pipe(first()).subscribe((idTokenClaim) => {
      if (idTokenClaim && idTokenClaim['sub'] !== broadcastMessage.auth0Id) {
        callback();
      }
    });
  }
}
