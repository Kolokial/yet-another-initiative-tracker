import { Injectable } from '@angular/core';
import { AuthService } from '@auth0/auth0-angular';
import { first } from 'rxjs';
import { AppServiceStore } from 'src/app/app.service.store';
import { UserApiService } from 'src/app/shared-services/user-api.service';
import { ReadUserResponse } from 'src/app/types/api/User';

@Injectable({
  providedIn: 'root',
})
export class LoginService {
  constructor(
    private auth0: AuthService,
    private userApi: UserApiService,
    private appServiceStore: AppServiceStore
  ) {
    this.init();
  }

  private init() {
    this.auth0.idTokenClaims$.pipe(first()).subscribe({
      next: (idToken) => {
        console.log(idToken);
        if (idToken) {
          const displayName = idToken.name ? idToken.name : (idToken.nickname as string);
          this.appServiceStore.auth0Id = idToken['sub'];
          this.userApi.getUser().subscribe({
            error: (error) => {
              if (error.status === 404) {
                this.userApi.createUser(idToken['sub'], displayName);
              }
            },
          });
        } else {
          console.warn('No auth0Id from Auth0.');
        }
      },
    });
  }
}
