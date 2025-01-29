import { Character } from './Character';

export interface Peer {
  auth0Id: string;
  displayName: string;
  characters: Character[];
  isDungeonMaster?: boolean;
  isNonPlayableCharacter?: boolean;
}
