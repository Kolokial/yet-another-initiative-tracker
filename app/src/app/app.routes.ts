import { Routes } from '@angular/router';
import { InitiativeTrackerComponent } from './components/initiative-tracker/initiative-tracker.component';
import { RoomComponent } from './components/room/room.component';
import { InitiativeListComponent } from './components/initiative-list/initiative-list.component';
import { LoginComponent } from './components/login/login.component';
import { UserComponent } from './components/user/user.component';

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
    canActivate: [],
  },
  {
    title: 'Initiative Tracker',
    path: 'init',
    component: InitiativeTrackerComponent,
  },
  {
    title: 'Room Manager',
    path: 'room/:roomId',
    component: RoomComponent,
  },
  {
    title: 'Room Manager',
    path: 'room',
    component: RoomComponent,
  },
  {
    title: 'Initiative Order',
    path: 'order',
    component: InitiativeListComponent,
  },
  {
    title: 'Login',
    path: 'login',
    component: LoginComponent,
  },
];
