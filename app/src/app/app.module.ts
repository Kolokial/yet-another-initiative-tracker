import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { SocketIoModule, SocketIoConfig } from 'ngx-socket-io';
import { AppComponent } from './app.component';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { MatTabsModule } from '@angular/material/tabs';
import { InitiativeTrackerComponent } from './initiative-tracker/initiative-tracker.component';
import { CommonModule } from '@angular/common';
import { QrScannerService } from './qr-scanner/qr-scanner.service';
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
import { RoomComponent } from './room/room.component';
import { routes } from './app.routes';
import { RoomService } from './room/room.service';
import { AuthButtonComponent } from './auth0/auth0.component';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { API_DOMAIN, API_SCHEME } from './constants';

//const config: SocketIoConfig = { url: 'http://192.168.0.8:3000', options: {} };
const config: SocketIoConfig = { url: 'http://localhost:3000', options: {} };

@NgModule({
  declarations: [AppComponent],
  imports: [
    CommonModule,
    BrowserModule,
    RouterModule.forRoot(routes),
    SocketIoModule.forRoot(config),
    MatTabsModule,
    InitiativeTrackerComponent,
    MatButtonModule,
    MatDividerModule,
    MatIconModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    RoomComponent,
    AuthButtonComponent,
  ],
  providers: [
    provideAnimationsAsync(),
    QrScannerService,
    provideRouter(routes, withComponentInputBinding()),
    RoomService,
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
