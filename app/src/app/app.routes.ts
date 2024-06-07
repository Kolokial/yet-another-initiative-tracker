import { Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { InitiativeTrackerComponent } from './initiative-tracker/initiative-tracker.component';
import { RoomManagerComponent } from './room-manager/room-manager.component';

export const routes: Routes = [

    { path: 'init', component: InitiativeTrackerComponent },
    { path: 'room', component: RoomManagerComponent },

    /* Hook up routes to navigation tabs */

];
