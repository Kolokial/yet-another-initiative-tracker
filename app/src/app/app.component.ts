import { ChangeDetectorRef, Component } from '@angular/core';
import { QrScannerService } from './components/qr-scanner/qr-scanner.service';
import { map, mergeMap, of, switchMap } from 'rxjs';
import { HasTitle } from './types/Title';
import { MediaMatcher } from '@angular/cdk/layout';
import { UserApiService } from './shared-services/user-api.service';
import { AuthService, User } from '@auth0/auth0-angular';
import { AppServiceStore } from './app.service.store';
import { CharacterManagerApiService } from './components/character-manager/character-manager.service';
import { environment } from 'src/environments/environment';
import { ReadUserResponse } from './types/api/User';
import { RoomService } from './components/room/room.service';
import { LoginService } from './components/login/login.service';

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

  public roomUrl!: string;

  private currentComponent!: HasTitle;

  public get componentTitle(): string {
    return this.currentComponent?.title;
  }

  constructor(
    private _loginSevice: LoginService,
    private userApi: UserApiService,
    private characterService: CharacterManagerApiService,
    public auth0: AuthService,
    private appServiceStore: AppServiceStore,
    private qrScanner: QrScannerService,
    private _roomService: RoomService,
    ref: ChangeDetectorRef,
    media: MediaMatcher
  ) {
    this.mobileQuery = media.matchMedia('(max-width: 600px)');
    this._mobileQueryListener = () => ref.detectChanges();
    this.mobileQuery.addListener(this._mobileQueryListener);
  }

  startScanning() {
    this.qrScanner.startScan();
  }

  ngOnInit() {
    this.getUserDisplayNameOnStartup();

    this.auth0.user$.subscribe((x) => console.log(x));
  }

  logout() {
    this.auth0.logout({ logoutParams: { returnTo: `${environment.hostname}/login` } });
  }

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
      .subscribe({
        next: (displayName) => {
          if (displayName) {
            this.appServiceStore.displayName.next(displayName);
          }
          this.getSelectedCharacterOnStartup();
        },
        error: (x) => {
          console.log(x);
        },
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
      .subscribe((characterList) => {
        if (characterList) {
          const slectedCharacter = characterList.find((x) => x.isInPlay) || null;
          this.appServiceStore.selectedCharacter.next(slectedCharacter);
        }
      });
  }
}
