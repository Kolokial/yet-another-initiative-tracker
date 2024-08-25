import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthService, User as AuthUser } from '@auth0/auth0-angular';
import { Observable, mergeMap, tap } from 'rxjs';
import { User } from '@shared-types/User';
import { BaseApi } from './BaseApi';

@Injectable({
  providedIn: 'root',
})
export class UserApiService extends BaseApi {
  constructor(http: HttpClient, auth: AuthService) {
    super(http, auth);
  }

  public canActivate(): Observable<boolean> {
    /* TODO: need to see if this can live somewhere else */
    return this.auth.isAuthenticated$;
  }

  public createUser(auth0Id: string, displayName?: string) {
    this.postRequest(`/api/user`, {
      auth0Id: auth0Id,
      displayName: displayName,
    }).subscribe({
      next: (response) => {
        console.log(response);
      },
    });
  }

  public updateUserDisplayName(displayName: string) {
    this.auth.user$
      .pipe(
        mergeMap((user: AuthUser | null | undefined) => {
          return this.postRequest(`/api/user`, { DisplayName: displayName });
        })
      )
      .subscribe({
        next: (response) => {
          console.log(response);
        },
      });
  }

  public getUser(): Observable<User> {
    return this.getRequest<User>(`/api/user`);
  }
}
