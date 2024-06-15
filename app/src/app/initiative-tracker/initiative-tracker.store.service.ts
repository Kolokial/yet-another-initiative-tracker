import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class InitiativeTrackerStoreService {
  public initiativeValue!: number;
  public dexterityModifier!: number;
  public alertFeat: boolean = false;
}
