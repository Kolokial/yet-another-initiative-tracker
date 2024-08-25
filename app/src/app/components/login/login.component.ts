import { CommonModule, DOCUMENT } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { AuthService } from '@auth0/auth0-angular';
import { UserApiService } from '../../shared-services/user-api.service';

@Component({
  selector: 'login',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  constructor(
    @Inject(DOCUMENT) public document: Document,
    public auth: AuthService,
    private user: UserApiService
  ) {
    this.auth.idTokenClaims$.subscribe({
      next: (idToken) => {
        console.log(idToken);
        if (idToken) {
          const userDisplayName: string = idToken.name
            ? idToken.name
            : (idToken.nickname as string);
          this.user.createUser(idToken['sub'], userDisplayName);

          this.user.getUser();
        }
      },
    });
    //this.auth.user$;
    //this.user.getUser(9);
  }

  parse(object: any) {
    return JSON.stringify(object);
  }
}
