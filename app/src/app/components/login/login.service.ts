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
  ) {}
}
