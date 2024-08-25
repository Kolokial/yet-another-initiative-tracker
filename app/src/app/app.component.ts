import { ChangeDetectorRef, Component } from '@angular/core';
import { SignalingService } from './shared-services/signaling.service';
import { QrScannerService } from './components/qr-scanner/qr-scanner.service';
import { MessagingService } from './shared-services/messaging.service';
import { SocketIoConfig } from 'ngx-socket-io';
import { RoomComponent } from './components/room/room.component';
import { InitiativeListComponent } from './components/initiative-list/initiative-list.component';
import { InitiativeTrackerComponent } from './components/initiative-tracker/initiative-tracker.component';
import { map, mergeMap, of, take } from 'rxjs';
import { HasTitle } from './types/title';
import { MediaMatcher } from '@angular/cdk/layout';
import { UserApiService } from './shared-services/user-api.service';
import { AuthService } from '@auth0/auth0-angular';
import { User } from '@shared-types/User';
import { AppServiceStore } from './app.service.store';

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

  get players(): string[] {
    return [...this.signalService.players, this.myPeerId];
  }

  public get roomUrl(): string {
    return `room/${this.messagingService.roomId}`;
  }

  private currentComponent!: HasTitle;

  public get componentTitle(): string {
    return this.currentComponent?.title;
  }

  constructor(
    private userApi: UserApiService,
    private signalService: SignalingService,
    private messagingService: MessagingService,
    private auth0: AuthService,
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
    this.getUserDisplayNameOnStartup();
  }

  onActivate(
    component: RoomComponent | InitiativeListComponent | InitiativeTrackerComponent
  ): void {
    this.currentComponent = component;
    if (component instanceof RoomComponent) {
      component.onLeaveRoom
        .pipe(take(1))
        .subscribe(() => this.signalService.disconnect());
    }
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
        map((value: string | User) => {
          return (value as User)?.DisplayName
            ? ((value as User).DisplayName as string)
            : (value as string);
        })
      )
      .subscribe((displayName) => {
        if (displayName) {
          this.appServiceStore.displayName.next(displayName);
        }
      });
  }
}
