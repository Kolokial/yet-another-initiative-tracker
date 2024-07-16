import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthService } from '@auth0/auth0-angular';
import { HttpOptions } from '@capacitor/core';
import { Observable, mergeMap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  constructor(
    private http: HttpClient,
    private auth: AuthService
  ) {}

  public getUser(id: number): any /*todo: create proper type */ {
    this.getRequest('http://localhost:8080/api/user/9').subscribe({
      next: (response) => {
        console.log(response);
      },
    });
  }

  private getRequest(url: string, options?: HttpOptions): Observable<any> {
    let header = new HttpHeaders();
    return this.auth.getAccessTokenSilently().pipe(
      mergeMap((token: string) => {
        /*Currently working on why headers aren't being sent */
        header = header.set('Authorization', `Bearer ${token}`);
        return this.http.get(url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      })
    );
  }
}
