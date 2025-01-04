import { Routes } from '@angular/router';
import { InitiativeTrackerComponent } from './components/initiative-tracker/initiative-tracker.component';
import { RoomComponent } from './components/room/room.component';
import { InitiativeListComponent } from './components/initiative-list/initiative-list.component';
import { LoginComponent } from './components/login/login.component';
import { AccountComponent } from './components/account/account.component';
import { canActivateUserGuard } from './guards/can-activate-user.guard';
import { CharacterManagerComponent } from './components/character-manager/character-manager.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    title: 'My Account',
    path: 'user',
    component: AccountComponent,
    canActivate: [canActivateUserGuard],
  },
  {
    title: 'Character Manager',
    path: 'character',
    component: CharacterManagerComponent,
    canActivate: [canActivateUserGuard],
  },
  {
    title: 'Initiative Tracker',
    path: 'init',
    component: InitiativeTrackerComponent,
    canActivate: [canActivateUserGuard],
  },
  {
    title: 'Initiative Order',
    path: 'room',
    component: RoomComponent,
    canActivate: [canActivateUserGuard],
  },
  {
    title: 'Login',
    path: 'login',
    component: LoginComponent,
  },
];
