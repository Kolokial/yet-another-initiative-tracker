import { APP_INITIALIZER, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { SocketIoModule, SocketIoConfig } from 'ngx-socket-io';
import { AppComponent } from './app.component';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { MatTabNav, MatTabsModule } from '@angular/material/tabs';
import { InitiativeTrackerComponent } from './components/initiative-tracker/initiative-tracker.component';
import { CommonModule } from '@angular/common';
import { QrScannerService } from './components/qr-scanner/qr-scanner.service';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { provideAuth0 } from '@auth0/auth0-angular';
import {
  RouterOutlet,
  RouterLink,
  RouterLinkActive,
  RouterModule,
  provideRouter,
  withComponentInputBinding,
} from '@angular/router';
import { RoomComponent } from './components/room/room.component';
import { routes } from './app.routes';
import { RoomService } from './components/room/room.service';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { AppServiceStore } from './app.service.store';
import { LoginComponent } from './components/login/login.component';
import { environment } from 'src/environments/environment';
import { LoginService } from './components/login/login.service';
import { SignalRService } from './shared-services/signal-r.service';
import { multicast } from 'rxjs';

//const config: SocketIoConfig = { url: 'http://192.168.0.8:3000', options: {} };
const config: SocketIoConfig = {
  url: environment.signalServer,
  options: { autoConnect: false, closeOnBeforeunload: true },
};

@NgModule({
  declarations: [AppComponent],
  imports: [
    CommonModule,
    BrowserModule,
    RouterModule.forRoot(routes),
    SocketIoModule.forRoot(config),
    MatTabsModule,
    InitiativeTrackerComponent,
    LoginComponent,
    MatButtonModule,
    MatDividerModule,
    MatIconModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    RoomComponent,
    MatToolbarModule,
    MatSidenavModule,
    MatListModule,
    MatTabNav,
  ],
  providers: [
    AppServiceStore,
    SignalRService,
    provideAnimationsAsync(),
    QrScannerService,
    provideRouter(routes, withComponentInputBinding()),
    RoomService,
    LoginService,
    provideAuth0({
      domain: 'dev-sulaeis36e3ik0p1.us.auth0.com',
      clientId: 'LaP8gm04fP6EnxRhmVBc8F86lCUKKAUA',
      authorizationParams: {
        redirect_uri: window.location.origin,
        audience: `yait`,
      },
    }),
    provideHttpClient(withInterceptorsFromDi()),
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
