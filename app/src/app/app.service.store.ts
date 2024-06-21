import { Injectable } from '@angular/core';
import { Observable, Subject, take } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AppServiceStore {
  public myPeerId: Observable<string> = new Observable<string>();

  public roomId: Observable<string> = new Observable<string>();
}
