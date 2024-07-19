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

  public createUser(id: number) {
    this.postRequest(`${API_FULL_URL}/api/user`, `{"auth0Id": "${id}"}`).subscribe({
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
}
