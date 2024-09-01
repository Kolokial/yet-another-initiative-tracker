import { Component } from '@angular/core';
import { UserApiService } from '../../shared-services/user-api.service';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { debounceTime } from 'rxjs';
import { User } from '@shared-types/User';
import { AppServiceStore } from 'src/app/app.service.store';
import { RoomService } from '../room/room.service';
import { MessagingService } from 'src/app/shared-services/messaging.service';

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
    private user: UserApiService,
    private appServiceStore: AppServiceStore,
    private room: RoomService,
    private messagingService: MessagingService
  ) {}

  ngOnInit() {
    this.userDisplayName.valueChanges
      .pipe(debounceTime(1000))
      .subscribe((displayName) => {
        this.user.updateUserDisplayName(displayName);
        this.appServiceStore.displayName.next(displayName);
        if (this.room.roomId && this.room.myPeerId) {
          this.messagingService.sendProfileUpdateToAllChannels();
        }
      });
    this.readUser();
  }

  private readUser() {
    this.user.getUser().subscribe((user: User) => {
      if (user && user.DisplayName) {
        this.userDisplayName.setValue(user.DisplayName);
      }
    });
  }
}
