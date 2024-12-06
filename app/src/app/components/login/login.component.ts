import { CommonModule, DOCUMENT } from '@angular/common';
import { Component, Inject, Input } from '@angular/core';
import { AuthService } from '@auth0/auth0-angular';
import { UserApiService } from '../../shared-services/user-api.service';
import { MatIconModule } from '@angular/material/icon';

import { environment } from 'src/environments/environment';

@Component({
  selector: 'login',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  @Input()
  debug: boolean = false;

  constructor(
    @Inject(DOCUMENT) public document: Document,
    public auth: AuthService
  ) {}

  login() {
    this.auth.loginWithRedirect();
  }

  logout() {
    this.auth.logout({
      logoutParams: { returnTo: `http://${environment.hostname}/login` },
    });
  }
}
