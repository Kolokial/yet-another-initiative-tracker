import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthService } from '@auth0/auth0-angular';
import { HttpOptions } from '@capacitor/core';
import { Observable, mergeMap } from 'rxjs';
import { API_FULL_URL } from '../constants';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  constructor(
    private http: HttpClient,
    private auth: AuthService
  ) {}

  public canActivate(): Observable<boolean> {
    /* TODO: need to move this out of the service */
    return this.auth.isAuthenticated$;
  }

  public createUser(auth0Id: number) {
    this.postRequest(`${API_FULL_URL}/api/user`, `{"auth0Id": "${auth0Id}"}`).subscribe({
      next: (response) => {
        console.log(response);
      },
    });
  }

  public updateUserDisplayName(displayName: string) {
    this.patchRequest(
      `${API_FULL_URL}/api/user/${auth0Id}/display-name`,
      `{"displayName":${displayName}}`
    ).subscribe({
      next: (response) => {
        console.log(response);
      },
    });
  }

  public getUser(id: number): any /*todo: create proper type */ {
    this.getRequest(`${API_FULL_URL}/api/user/${id}`).subscribe({
      next: (response) => {
        console.log(response);
      },
    });
  }

  private getRequest(url: string): Observable<any> {
    let header = new HttpHeaders();
    return this.auth.getAccessTokenSilently().pipe(
      mergeMap((token: string) => {
        header = header.set('Authorization', `Bearer ${token}`);
        return this.http.get(url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      })
    );
  }

  private postRequest<T>(url: string, body: T): Observable<any> {
    return this.auth.getAccessTokenSilently().pipe(
      mergeMap((token: string) => {
        return this.http.post(url, body, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
      })
    );
  }

  private patchRequest<T>(url: string, body: T): Observable<any> {
    return this.auth.getAccessTokenSilently().pipe(
      mergeMap((token: string) => {
        return this.http.patch(url, body, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
      })
    );
  }
}
