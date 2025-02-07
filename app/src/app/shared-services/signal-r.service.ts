import { inject, Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { environment } from 'src/environments/environment';
import { AppServiceStore } from '../app.service.store';
import { defer, first, from, Observable, of, Subject, switchMap } from 'rxjs';
import { AuthService, IdToken } from '@auth0/auth0-angular';
import { Peer } from '../types/messageContracts/Peer';
import { Broadcast } from '../types/messageContracts/Broadcast';
import { Envelope } from '../types/messageContracts/Envelope';
import { TurnFinishedBroadcast } from '../types/messageContracts/finishTurn/TurnFinishedBroadcast';
import { JoinRoomRequest } from '../types/messageContracts/joinRoom/JoinRoomRequest';
import { LeaveRoomRequest } from '../types/messageContracts/leaveRoom/LeaveRoomRequest';
import { RollDiceRequest } from '../types/messageContracts/rollDice/RollDiceRequest';
import { UpdateDisplayNameBroadcast as DisplayNameUpdatedBroadcast } from '../types/messageContracts/updateDisplayName/DisplayNameUpdatedBroadcast';
import { UpdateDisplayNameRequest } from '../types/messageContracts/updateDisplayName/UpdateDisplayNameRequest';
import { RoomLeftBroadcast } from '../types/messageContracts/leaveRoom/RoomLeftBroadcast';
import { RoomJoinedBroadcast } from '../types/messageContracts/joinRoom/RoomJoinedBroadcast';
import { FinishTurnRequest } from '../types/messageContracts/finishTurn/FinishTurnRequest';
import { DiceRolledBroadcast } from '../types/messageContracts/rollDice/DiceRolledBroadcast';
import { JoinRoomResponse } from '../types/messageContracts/joinRoom/JoinRoomResponse';
import { CharacterInPlayUpdatedBroadcast } from '../types/messageContracts/updateCharacterInPlay/CharacterInPlayUpdatedBroadcast';
import { UpdateCharacterInPlayRequest } from '../types/messageContracts/updateCharacterInPlay/UpdateCharacterInPlayRequest';
import { UpdateInitiativeRequest } from '../types/messageContracts/updateInitiative/UpdateInitiativeRequest';
import { InitiativeUpdatedBroadcast } from '../types/messageContracts/updateInitiative/InitiativeUpdatedBroadcast';
import { UserType } from '../types/formGroups/JoinRoom.FormGroup';
import { Character } from '../types/messageContracts/Character';
import { CharacterAddedBroadcast } from '../types/messageContracts/addCharacter/CharacterAddedBroadcast';
import { AddCharacterRequest } from '../types/messageContracts/addCharacter/AddCharacterRequest';
import { RemoveCharacterRequest } from '../types/messageContracts/removeCharacter/RemoveCharacterRequest';
import { CharacteRemovedBroadcast } from '../types/messageContracts/removeCharacter/CharacterRemovedBroadcast';
import { HubConnectionState } from '@microsoft/signalr';
import { MatSnackBar } from '@angular/material/snack-bar';
import { InitiativeListSortedBroadcast } from '../types/messageContracts/sortInitiativeList/InitiativeListSortedBroadcast';
import { SortInitiativeListRequest } from '../types/messageContracts/sortInitiativeList/SortInitiativeList';

@Injectable({
  providedIn: 'root',
})
export class SignalRService {
  private _onRoomJoined$ = new Subject<Peer>();
  public get onRoomJoined$(): Observable<Peer> {
    return this._onRoomJoined$.asObservable();
  }

  private _onRoomLeft$ = new Subject<Peer>();
  public get onRoomLeft$(): Observable<Peer> {
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

  private _onInitiativeUpdated$ = new Subject<InitiativeUpdatedBroadcast>();
  public get onInitiativeUpdated$(): Observable<InitiativeUpdatedBroadcast> {
    return this._onInitiativeUpdated$.asObservable();
  }

  private _onCharacterAdded$ = new Subject<Character>();
  public get onCharacterAdded$(): Observable<Character> {
    return this._onCharacterAdded$.asObservable();
  }

  private _onCharacterRemoved$ = new Subject<CharacteRemovedBroadcast>();
  public get onCharacterRemoved$(): Observable<CharacteRemovedBroadcast> {
    return this._onCharacterRemoved$.asObservable();
  }

  private _onInitiativeListSorted$ = new Subject<InitiativeListSortedBroadcast>();
  public get onInitiativeListSorted$(): Observable<InitiativeListSortedBroadcast> {
    return this._onInitiativeListSorted$.asObservable();
  }

  private _hubConnection: signalR.HubConnection;
  private _snackBar = inject(MatSnackBar);
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
    this.handleReconnect();
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

  private handleReconnect(): void {
    this._hubConnection.onreconnecting((x) => {
      console.log(x);
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
    this._hubConnection.on('CharacterAdded', (broadcastMsg: CharacterAddedBroadcast) =>
      this.onCharacterAdded(broadcastMsg)
    );
    this._hubConnection.on('CharacterRemoved', (broadcastMsg: CharacteRemovedBroadcast) =>
      this.onCharacterRemoved(broadcastMsg)
    );
    this._hubConnection.on(
      'InitiativeListSorted',
      (broadcastMsg: InitiativeListSortedBroadcast) =>
        this.onInitiativeListSorted(broadcastMsg)
    );
  }

  public joinRoom(
    roomName: string,
    userType: UserType,
    characters: Character[]
  ): Observable<JoinRoomResponse> {
    return this.invoke<JoinRoomRequest, JoinRoomResponse>('JoinRoom', {
      roomName: roomName,
      /* probably should have these passed in */
      characters: characters,
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

  public updateCharacterInPlayName(id: number, name: string): Observable<void> {
    return this.invoke<UpdateCharacterInPlayRequest, void>('UpdateCharacterInPlay', {
      characterName: name,
      characterId: id,
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

  public rollDice(diceRoll: number, characterId: number): Observable<void> {
    return this.invoke<RollDiceRequest, void>('RollDice', {
      diceRoll: diceRoll,
      characterId: characterId,
    });
  }

  public addCharacter(character: Character): Observable<void> {
    return this.invoke<AddCharacterRequest, void>('AddCharacter', {
      character: character,
    });
  }

  public removeCharacter(characterId: number): Observable<void> {
    return this.invoke<RemoveCharacterRequest, void>('RemoveCharacter', {
      characterId: characterId,
    });
  }

  public sortInitiativeList(): Observable<void> {
    return this.invoke<SortInitiativeListRequest, void>('SortInitiativeList', {});
  }

  private invoke<T, O>(method: string, message: T): Observable<O> {
    return this.auth.idTokenClaims$.pipe(
      first(),
      switchMap((idTokenClaim: IdToken | null | undefined) => {
        if (!idTokenClaim) {
          console.error('IdTokenClaim has failed. Are you logged in?');
          return of();
        }

        if (this._hubConnection.state !== HubConnectionState.Connected) {
          this._snackBar.open('Not connected.');
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
    this.doAuthCheck(broadcastMessage, () => {
      this._onRoomJoined$.next(broadcastMessage.peer);
      console.log('Peer Joined: ', broadcastMessage);
    });
  }

  private onRoomLeft(broadcastMessage: RoomLeftBroadcast): void {
    this.doAuthCheck(broadcastMessage, () => {
      this._onRoomLeft$.next(broadcastMessage.peer);
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
    this._onInitiativeUpdated$.next(broadcastMessage);
  }

  private onCharacterAdded(broadcastMessage: CharacterAddedBroadcast): void {
    this._onCharacterAdded$.next(broadcastMessage.character);
  }

  private onCharacterRemoved(broadcastMessage: CharacteRemovedBroadcast): void {
    this._onCharacterRemoved$.next(broadcastMessage);
  }

  private onInitiativeListSorted(broadcastMessage: InitiativeListSortedBroadcast): void {
    this._onInitiativeListSorted$.next(broadcastMessage);
  }

  private doAuthCheck(broadcastMessage: Broadcast, callback: () => void): void {
    this.auth.idTokenClaims$.pipe(first()).subscribe((idTokenClaim) => {
      if (idTokenClaim && idTokenClaim['sub'] !== broadcastMessage.auth0Id) {
        callback();
      }
    });
  }
}
