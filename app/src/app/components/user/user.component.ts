import { Component } from '@angular/core';
import { UserService } from '../../shared-services/user.service';
import { CanActivate } from '@angular/router';

@Component({
  selector: 'user',
  standalone: true,
  imports: [],
  templateUrl: './user.component.html',
  styleUrl: './user.component.scss',
})
export class UserComponent {
  constructor(private user: UserService) {}
}
