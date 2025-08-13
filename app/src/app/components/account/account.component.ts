import { Component } from '@angular/core';
import { UserApiService } from '../../shared-services/user-api.service';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { AppServiceStore } from 'src/app/app.service.store';
import { RoomService } from '../room/room.service';
import { ReadUserResponse } from '@shared-types/api/User';
import { SignalRService } from 'src/app/shared-services/signal-r.service';

@Component({
  selector: 'account',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatInputModule],
  templateUrl: './account.component.html',
  styleUrl: './account.component.scss',
})
export class AccountComponent {
  /* TODO: Add user displayname to initiative order, under character name.*/
  public userDisplayName: FormControl<string> = new FormControl();
  constructor(
    private _user: UserApiService,
    private _appServiceStore: AppServiceStore,
    private _room: RoomService,
    private _signalR: SignalRService
  ) {}

  ngOnInit() {
    this.readUser();
    this.userDisplayName.valueChanges
      .pipe(debounceTime(1000), distinctUntilChanged())
      .subscribe((displayName) => {
        this._user.updateUserDisplayName(displayName);
        this._appServiceStore.displayName.next(displayName);

        this._signalR
          .updateDisplayName(displayName)
          .subscribe((x) => console.log('DisplayName Updated'));
      });
  }

  private readUser() {
    this._user.getUser().subscribe((user: ReadUserResponse) => {
      if (user && user.displayName) {
        this.userDisplayName.setValue(user.displayName, { emitEvent: false });
      }
    });
  }
}
