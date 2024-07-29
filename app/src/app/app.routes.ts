import { Routes } from '@angular/router';
import { InitiativeTrackerComponent } from './components/initiative-tracker/initiative-tracker.component';
import { RoomComponent } from './components/room/room.component';
import { InitiativeListComponent } from './components/initiative-list/initiative-list.component';
import { LoginComponent } from './components/login/login.component';
import { UserComponent } from './components/user/user.component';
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
    component: UserComponent,
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
    title: 'Room Manager',
    path: 'room/:roomId',
    component: RoomComponent,
    canActivate: [canActivateUserGuard],
  },
  {
    title: 'Room Manager',
    path: 'room',
    component: RoomComponent,
    canActivate: [canActivateUserGuard],
  },
  {
    title: 'Initiative Order',
    path: 'order',
    component: InitiativeListComponent,
    canActivate: [canActivateUserGuard],
  },
  {
    title: 'Login',
    path: 'login',
    component: LoginComponent,
  },
];
