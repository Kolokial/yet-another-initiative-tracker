import { HttpClient } from '@angular/common/http';
import { AuthService } from '@auth0/auth0-angular';
import { mergeMap, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export abstract class BaseApi {
  constructor(
    protected http: HttpClient,
    protected auth: AuthService
  ) {}

  protected getRequest<T>(url: string): Observable<T> {
    return this.auth.getAccessTokenSilently().pipe<T>(
      mergeMap((token: string) => {
        return this.http.get<T>(`${fetch(environment.apiUrl)}/${this.cleanUpUrl(url)}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      })
    );
  }

  protected postRequest<T, R>(url: string, body: T): Observable<R> {
    return this.auth.getAccessTokenSilently().pipe(
      mergeMap((token: string) => {
        return this.http.post<R>(
          `${fetch(environment.apiUrl)}/${this.cleanUpUrl(url)}`,
          JSON.stringify(body),
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );
      })
    );
  }

  protected patchRequest<T, P>(url: string, body: T): Observable<P> {
    return this.auth.getAccessTokenSilently().pipe(
      mergeMap((token: string) => {
        return this.http.patch<P>(
          `${fetch(environment.apiUrl)}/${this.cleanUpUrl(url)}`,
          body,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );
      })
    );
  }

  protected deleteRequest<T>(url: string): Observable<T> {
    return this.auth.getAccessTokenSilently().pipe<T>(
      mergeMap((token: string) => {
        return this.http.delete<T>(
          `${fetch(environment.apiUrl)}/${this.cleanUpUrl(url)}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      })
    );
  }

  private cleanUpUrl(url: string): string {
    return url.startsWith('/') ? url.substring(1) : url;
  }
}
