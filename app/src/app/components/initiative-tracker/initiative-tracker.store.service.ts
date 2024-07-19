import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class InitiativeTrackerStoreService {
  public initiativeRoll!: number;
  public dexterityScore!: number;
  public alertFeat: boolean = false;
  public luckStone: boolean = false;
  public agilityStone: boolean = false;
  public scorpionArmor: boolean = false;
}
