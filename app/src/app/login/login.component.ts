import { CommonModule, DOCUMENT } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { AuthService } from '@auth0/auth0-angular';
import { UserService } from '../user.service';

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
    private user: UserService
  ) {
    this.auth.idTokenClaims$.subscribe({
      next: (obj) => {
        console.log(obj);
        this.user.createUser(obj?.['sub']);
      },
    });
    //this.auth.user$;
    //this.user.getUser(9);
  }

  parse(object: any) {
    return JSON.stringify(object);
  }
}
