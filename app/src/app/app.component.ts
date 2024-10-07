import { ChangeDetectorRef, Component } from '@angular/core';
import { QrScannerService } from './components/qr-scanner/qr-scanner.service';
import { MessagingService } from './shared-services/messaging.service';
import { SocketIoConfig } from 'ngx-socket-io';
import { map, mergeMap, of, switchMap } from 'rxjs';
import { HasTitle } from './types/Title';
import { MediaMatcher } from '@angular/cdk/layout';
import { UserApiService } from './shared-services/user-api.service';
import { AuthService } from '@auth0/auth0-angular';
import { User } from '@shared-types/User';
import { AppServiceStore } from './app.service.store';
import { CharacterManagerApiService } from './components/character-manager/character-manager.service';
import { environment } from 'src/environments/environment';
import { ReadUserResponse } from '@shared-types/api/User';

//const config: SocketIoConfig = { url: 'http://192.168.0.8:3000', options: {} };
const config: SocketIoConfig = { url: 'http://localhost:3000', options: {} };

@Component({
  selector: 'app-root',
  providers: [QrScannerService],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  message!: string;
  receivedMessages: { sender: string; message: string }[] = [];
  myPeerId!: string;
  activeLink: any;
  mobileQuery: MediaQueryList;
  private _mobileQueryListener: () => void;

  public get roomUrl(): string {
    return `room/${this.messagingService.roomId}`;
  }

  private currentComponent!: HasTitle;

  public get componentTitle(): string {
    return this.currentComponent?.title;
  }

  constructor(
    private userApi: UserApiService,
    private characterService: CharacterManagerApiService,

    private messagingService: MessagingService,
    public auth0: AuthService,
    private appServiceStore: AppServiceStore,
    private qrScanner: QrScannerService,
    ref: ChangeDetectorRef,
    media: MediaMatcher
  ) {
    this.mobileQuery = media.matchMedia('(max-width: 600px)');
    this._mobileQueryListener = () => ref.detectChanges();
    this.mobileQuery.addListener(this._mobileQueryListener);
    // Camera.getPhoto({
    //   quality: 90,
    //   allowEditing: true,
    //   resultType: CameraResultType.Uri
    // }).then(x => {
    //   console.log(x);
    // });
  }

  startScanning() {
    this.qrScanner.startScan();
  }

  ngOnInit() {
    this.determineAuthenticationStatus();
    this.getUserDisplayNameOnStartup();
    this.getSelectedCharacterOnStartup();
  }

  logout() {
    this.auth0.logout({ logoutParams: { returnTo: ` ${environment.hostname}` } });
  }

  // onActivate(
  //   component: RoomComponent | InitiativeListComponent | InitiativeTrackerComponent
  // ): void {
  //   this.currentComponent = component;
  //   if (component instanceof RoomComponent) {
  //     component.onLeaveRoom
  //       .pipe(take(1))
  //       .subscribe(() => this.signalService.disconnect());
  //   }
  // }

  private getUserDisplayNameOnStartup() {
    this.auth0.isAuthenticated$
      .pipe(
        mergeMap((isAuthenticated) => {
          console.log('authed, getting user data');
          if (isAuthenticated) {
            return this.userApi.getUser();
          }
          return of('');
        }),
        map((value: string | ReadUserResponse) => {
          return (value as ReadUserResponse)?.displayName
            ? ((value as ReadUserResponse).displayName as string)
            : (value as string);
        })
      )
      .subscribe((displayName) => {
        if (displayName) {
          this.appServiceStore.displayName.next(displayName);
        }
      });
  }

  private getSelectedCharacterOnStartup() {
    this.auth0.isAuthenticated$
      .pipe(
        switchMap((isAuthed) => {
          if (isAuthed) {
            return this.characterService.readCharacters();
          }
          return of(null);
        })
      )
      .subscribe((x) => {
        if (x) {
          this.appServiceStore.selectedCharacter.next(x[0]);
        }
      });
  }

  private determineAuthenticationStatus(): void {
    this.auth0.idTokenClaims$.subscribe({
      next: (idToken) => {
        console.log(idToken);
        if (idToken) {
          const userDisplayName: string = idToken.name
            ? idToken.name
            : (idToken.nickname as string);
          this.userApi.createUser(idToken['sub'], userDisplayName);

          this.userApi.getUser();
        }
      },
    });
  }
}
