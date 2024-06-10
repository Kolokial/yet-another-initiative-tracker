import { Routes } from '@angular/router';
import { InitiativeTrackerComponent } from './initiative-tracker/initiative-tracker.component';
import { RoomManagerComponent } from './room-manager/room-manager.component';
import { InitiativeListComponent } from './initiative-list/initiative-list.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'room',
    pathMatch: 'full',
  },
  {
    title: 'Initiative Tracker',
    path: 'init',
    component: InitiativeTrackerComponent,
  },
  {
    title: 'Room Manager',
    path: 'room/:roomId',
    component: RoomManagerComponent,
  },
  {
    title: 'Room Manager',
    path: 'room',
    component: RoomManagerComponent,
  },
  {
    title: 'Initiative Order',
    path: 'order',
    component: InitiativeListComponent,
  },
];
