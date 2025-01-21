import { FormControl } from '@angular/forms';

export interface JoinRoomFormGroup {
  roomCode: FormControl<string | null>;
  userType: FormControl<UserType>;
}

export type UserType = 'player' | 'dungeon-master' | 'spectator' | null;
