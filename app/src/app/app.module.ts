import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { SocketIoModule, SocketIoConfig } from 'ngx-socket-io';
import { AppComponent } from './app.component';
import { FormsModule } from '@angular/forms';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { MatTabsModule } from '@angular/material/tabs';
import { InitiativeTrackerComponent } from './initiative-tracker/initiative-tracker.component';
import { CommonModule } from '@angular/common';
import { QRCodeModule } from 'angularx-qrcode';
import { QrScannerService } from './qr-scanner/qr-scanner.service';
import {MatIconModule} from '@angular/material/icon';
import {MatDividerModule} from '@angular/material/divider';
import {MatButtonModule} from '@angular/material/button';

//const config: SocketIoConfig = { url: 'http://192.168.0.8:3000', options: {} };
const config: SocketIoConfig = { url: 'http://localhost:3000', options: {} };


@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    CommonModule,
    BrowserModule,
    FormsModule,
    SocketIoModule.forRoot(config),
    MatTabsModule,
    InitiativeTrackerComponent,
    QRCodeModule,
    MatButtonModule, MatDividerModule, MatIconModule
  ],
  providers: [
    provideAnimationsAsync(),
    QrScannerService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }