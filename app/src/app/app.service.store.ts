import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AppServiceStore {
  public displayName: BehaviorSubject<string> = new BehaviorSubject('');

  constructor() {}
}
