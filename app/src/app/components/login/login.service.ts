import { Injectable } from '@angular/core';
import { AuthService } from '@auth0/auth0-angular';
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
    this.auth0.idTokenClaims$.subscribe({
      next: (idToken) => {
        console.log(idToken);
        if (idToken) {
          this.userApi.getUser().subscribe((ReadUserResponse: ReadUserResponse) => {
            if (!ReadUserResponse) {
              const displayName = idToken.name
                ? idToken.name
                : (idToken.nickname as string);
              this.userApi.createUser(idToken['sub'], displayName);
              this.appServiceStore.displayName.next(displayName);
            }
          });
        } else {
          console.warn('No auth0Id from Auth0.');
        }
      },
    });
  }
}
