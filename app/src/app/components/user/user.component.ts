import { Component } from '@angular/core';
import { UserApiService } from '../../shared-services/user-api.service';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { debounceTime } from 'rxjs';
import { User } from '@shared-types/User';

@Component({
  selector: 'user',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatInputModule],
  templateUrl: './user.component.html',
  styleUrl: './user.component.scss',
})
export class UserComponent {
  /* TODO: Add user displayname to initiative order, under character name.*/
  public userDisplayName: FormControl = new FormControl();
  constructor(private user: UserApiService) {}

  ngOnInit() {
    this.userDisplayName.valueChanges
      .pipe(debounceTime(1000))
      .subscribe((displayName) => {
        this.user.updateUserDisplayName(displayName);
      });
    this.readUser();
  }

  private readUser() {
    this.user.getUser().subscribe((user: User) => {
      this.userDisplayName.setValue(user.DisplayName);
    });
  }
}
