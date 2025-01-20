import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { environment } from 'src/environments/environment';
import { AppServiceStore } from '../app.service.store';
import { defer, first, from, Observable, of, Subject, switchMap } from 'rxjs';

import { AuthService, IdToken } from '@auth0/auth0-angular';
import { Peer } from '../types/messageContracts/Peer';
import { Broadcast } from '../types/messageContracts/Broadcast';
import { Envelope } from '../types/messageContracts/Envelope';
import { TurnFinishedBroadcast } from '../types/messageContracts/finishTurn/TurnFinishedBroadcast';
import { JoinRoomRequest } from '../types/messageContracts/JoinRoom/JoinRoomRequest';
import { LeaveRoomRequest } from '../types/messageContracts/leaveRoom/LeaveRoomRequest';
import { RollDiceRequest } from '../types/messageContracts/rollDice/RollDiceRequest';
import { UpdateDisplayNameBroadcast as DisplayNameUpdatedBroadcast } from '../types/messageContracts/updateDisplayName/DisplayNameUpdatedBroadcast';
import { UpdateDisplayNameRequest } from '../types/messageContracts/updateDisplayName/UpdateDisplayNameRequest';
import { RoomLeftBroadcast } from '../types/messageContracts/leaveRoom/RoomLeftBroadcast';
import { RoomJoinedBroadcast } from '../types/messageContracts/JoinRoom/RoomJoinedBroadcast';
import { FinishTurnRequest } from '../types/messageContracts/finishTurn/FinishTurnRequest';
import { DiceRolledBroadcast } from '../types/messageContracts/rollDice/DiceRolledBroadcast';
import { JoinRoomResponse } from '../types/messageContracts/JoinRoom/JoinRoomResponse';
import { CharacterInPlayUpdatedBroadcast } from '../types/messageContracts/updateCharacterInPlay/CharacterInPlayUpdatedBroadcast';
import { UpdateCharacterInPlayRequest } from '../types/messageContracts/updateCharacterInPlay/UpdateCharacterInPlayRequest';
import { UpdateInitiativeRequest } from '../types/messageContracts/updateInitiative/UpdateInitiativeRequest';
import { InitiativeUpdatedBroadcast } from '../types/messageContracts/updateInitiative/InitiativeUpdatedBroadcast';
import { ResponseBase } from '../types/messageContracts/ResponseBase';
import { UserType } from '../types/formGroups/JoinRoom.FormGroup';

@Injectable({
  providedIn: 'root',
})
export class SignalRService {
  private _onRoomJoined$ = new Subject<Peer>();
  public get onRoomJoined$(): Observable<Peer> {
    return this._onRoomJoined$.asObservable();
  }

  private _onRoomLeft$ = new Subject<string>();
  public get onRoomLeft$(): Observable<string> {
    return this._onRoomLeft$.asObservable();
  }

  private _onDisplayNameUpdated$ = new Subject<DisplayNameUpdatedBroadcast>();
  public get onDisplayNameUpdated$(): Observable<DisplayNameUpdatedBroadcast> {
    return this._onDisplayNameUpdated$.asObservable();
  }

  private _onCharacterInPlayUpdated$ = new Subject<CharacterInPlayUpdatedBroadcast>();
  public get onCharacterInPlayUpdated$(): Observable<CharacterInPlayUpdatedBroadcast> {
    return this._onCharacterInPlayUpdated$.asObservable();
  }

  private _onDiceRolled$ = new Subject<DiceRolledBroadcast>();
  public get onDiceRolled$(): Observable<DiceRolledBroadcast> {
    return this._onDiceRolled$.asObservable();
  }

  private _onTurnFinished$ = new Subject<string>();
  public get onTurnFinished$(): Observable<string> {
    return this._onTurnFinished$.asObservable();
  }

  private _onInitiativeUpdated$ = new Subject<number>();
  public get onInitiativeUpdated$(): Observable<number> {
    return this._onInitiativeUpdated$.asObservable();
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

    this.startConnection();
  }

  private startConnection(): void {
    this._hubConnection
      .start()
      .then((fulfilled) => {
        console.assert(
          this._hubConnection.state === signalR.HubConnectionState.Connected
        );
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
      this.onRoomJoined(broadcastMsg)
    );
    this._hubConnection.on('RoomLeft', (broadcastMsg: RoomLeftBroadcast) =>
      this.onRoomLeft(broadcastMsg)
    );
    this._hubConnection.on(
      'DisplayNameUpdated',
      (broadcastMsg: DisplayNameUpdatedBroadcast) =>
        this.onDisplayNameUpdated(broadcastMsg)
    );
    this._hubConnection.on(
      'CharacterInPlayUpdated',
      (broadcastMsg: CharacterInPlayUpdatedBroadcast) =>
        this.onCharacterInPlayUpdated(broadcastMsg)
    );
    this._hubConnection.on('DiceRolled', (broadcastMsg: DiceRolledBroadcast) =>
      this.onDiceRolled(broadcastMsg)
    );
    this._hubConnection.on('TurnFinished', (broadcastMsg: TurnFinishedBroadcast) =>
      this.onTurnFinished(broadcastMsg)
    );
    this._hubConnection.on(
      'InitiativeUpdated',
      (broadcastMsg: InitiativeUpdatedBroadcast) => this.onInitiativeUpdated(broadcastMsg)
    );
  }

  public joinRoom(roomName: string, userType: UserType): Observable<JoinRoomResponse> {
    return this.invoke<JoinRoomRequest, JoinRoomResponse>('JoinRoom', {
      roomName: roomName,
      /* probably should have these passed in */
      characterName: this.appStore.selectedCharacter.value?.characterName,
      diceRoll: this.appStore.lastSentRoll,
      displayName: this.appStore.displayName.value,
      isDungeonMaster: userType === 'dungeon-master',
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

  public updateCharacterInPlayName(characterName: string): Observable<void> {
    return this.invoke<UpdateCharacterInPlayRequest, void>('UpdateCharacterInPlay', {
      characterName: characterName,
    });
  }

  public updateInitiative(initiative: number): Observable<void> {
    return this.invoke<UpdateInitiativeRequest, void>('UpdateInitiative', {
      initiative: initiative,
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
          console.error('IdTokenClaim has failed. Are you logged in?');
          return of();
        }
        const envelope: Envelope<T> = {
          auth0Id: idTokenClaim['sub'],
          message: message,
          dateStamp: new Date(),
        };
        const promise = this._hubConnection.invoke<O>(method, envelope);
        promise.catch(console.error);
        return defer(() => from(promise));
      })
    );
  }

  private onRoomJoined(broadcastMessage: RoomJoinedBroadcast): void {
    this.auth.idTokenClaims$.pipe(first()).subscribe((idTokenClaim) => {
      if (idTokenClaim && idTokenClaim['sub']) {
        this._onRoomJoined$.next(broadcastMessage.peer);
        console.log('Peer Joined: ', broadcastMessage);
      }
    });
  }

  private onRoomLeft(broadcastMessage: RoomLeftBroadcast): void {
    this.doAuthCheck(broadcastMessage, () => {
      this._onRoomLeft$.next(broadcastMessage.auth0Id);
      console.log('Peer Left: ', broadcastMessage);
    });
  }

  private onDiceRolled(broadcastMsg: DiceRolledBroadcast): void {
    this.auth.idTokenClaims$.pipe(first()).subscribe((idTokenClaim) => {
      if (idTokenClaim && idTokenClaim['sub']) {
        this._onDiceRolled$.next(broadcastMsg);
      }
    });
  }

  private onDisplayNameUpdated(broadcastMessage: DisplayNameUpdatedBroadcast): void {
    this._onDisplayNameUpdated$.next(broadcastMessage);
  }

  private onCharacterInPlayUpdated(
    broadcastMessage: CharacterInPlayUpdatedBroadcast
  ): void {
    this._onCharacterInPlayUpdated$.next(broadcastMessage);
  }

  private onTurnFinished(broadcastMsg: TurnFinishedBroadcast): void {
    this.doAuthCheck(broadcastMsg, () => {
      this._onTurnFinished$.next(broadcastMsg.auth0Id);
      console.log(broadcastMsg.auth0Id, 'finished their turn.');
    });
  }

  private onInitiativeUpdated(broadcastMessage: InitiativeUpdatedBroadcast): void {
    this._onInitiativeUpdated$.next(broadcastMessage.initiative);
  }

  private doAuthCheck(broadcastMessage: Broadcast, callback: () => void): void {
    this.auth.idTokenClaims$.pipe(first()).subscribe((idTokenClaim) => {
      if (idTokenClaim && idTokenClaim['sub'] !== broadcastMessage.auth0Id) {
        callback();
      }
    });
  }
}
