import { Component, Inject } from '@angular/core';
import { AuthService } from '@auth0/auth0-angular';
import { CommonModule, DOCUMENT } from '@angular/common';

@Component({
  selector: 'app-auth-button',
  imports: [CommonModule],
  template: `<ng-container *ngIf="auth.isAuthenticated$ | async; else loggedOut">
      <button
        (click)="
          auth.logout({ logoutParams: { returnTo: 'http://localhost:4200/room' } })
        "
      >
        Log out
      </button>
    </ng-container>

    <ng-template #loggedOut>
      <button (click)="auth.loginWithRedirect()">Log in</button>
    </ng-template>`,
  standalone: true,
})
export class AuthButtonComponent {
  // Inject the authentication service into your component through the constructor
  constructor(
    @Inject(DOCUMENT) public document: Document,
    public auth: AuthService
  ) {}
}
