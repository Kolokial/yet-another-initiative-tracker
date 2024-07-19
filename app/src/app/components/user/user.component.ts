import { Component } from '@angular/core';
import { UserService } from '../../shared-services/user.service';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'user',
  standalone: true,
  imports: [CommonModule, FormsModule, MatInputModule],
  templateUrl: './user.component.html',
  styleUrl: './user.component.scss',
})
export class UserComponent {
  /* TODO: Add user displayname to initiative order, under character name.*/
  public displayName: string = '';
  constructor(private user: UserService) {}
}
