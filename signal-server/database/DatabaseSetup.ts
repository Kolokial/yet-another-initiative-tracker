import sqlite3, { Database } from "sqlite3";
import { User } from "@shared-types/User";
import { PlayerCharacter } from "@shared-types/Character";

const DATABASE_PATH = `${process.cwd()}/database/myTestDatabase.db`;

export class DatabaseSetup {
  private databaseConnection: Database;

  constructor() {
    this.databaseConnection = new sqlite3.Database(
      DATABASE_PATH,
      sqlite3.OPEN_READWRITE,
      (err) => {
        if (err) {
          console.log(
            "there was a problem opening the db.",
            err,
            process.cwd()
          );
        }
      }
    );
  }

  public readUser(auth0Id: string): Promise<User> {
    return new Promise((resolve, reject) => {
      this.databaseConnection.get(
        `SELECT DisplayName 
         FROM User
        WHERE Auth0Id = $Auth0Id`,
        {
          $Auth0Id: auth0Id,
        },
        (err, row: User) => {
          if (err) {
            console.log(err);
            reject(err);
          }
          console.log(`User result set:`, row);
          resolve(row);
        }
      );
    });
  }

  public upsertUser(auth0Id: string, displayName: string) {
    console.log(`inserting ${displayName}, ${auth0Id}`);
    this.databaseConnection.run(
      `INSERT OR IGNORE 
         INTO User (Auth0Id, DisplayName) VALUES($auth0Id, $displayName)
         ON CONFLICT (Auth0Id) DO UPDATE 
         SET DisplayName = $displayName
         WHERE Auth0Id = $auth0Id`,
      {
        $auth0Id: auth0Id,
        $displayName: displayName,
      },
      (err) => {
        console.log("ran the query, now what?", err);
      }
    );
  }

  public createCharacter(auth0Id: string, character: PlayerCharacter) {
    this.databaseConnection.run(
      `
      INSERT INTO PlayerCharacter (UserId, CharacterName, DexterityMod)
      SELECT UserId,
             $CharacterName AS CharacterName,
             $DextirityMod AS DexterityMod
        FROM User
       WHERE Auth0Id = $auth0Id
    `,
      {
        $CharacterName: character.CharacterName,
        $DextirityMod: character.DexterityMod,
        $auth0Id: auth0Id,
      },
      (err) => {
        console.log(err);
      }
    );
  }

  public readCharacter(
    auth0Id: string,
    characterId: string
  ): Promise<PlayerCharacter | Error> {
    return new Promise((resolve, reject) => {
      this.databaseConnection.get(
        `SELECT CharacterName,
              DexterityMod,
              LuckStone,
              AlertFeat
              IsDeleted
         FROM PlayerCharacter AS PC
        INNER JOIN User AS U
           ON U.UserId = PC.UserId
        WHERE U.Auth0Id = $auth0Id
          AND PC.PlayerCharacterId = $CharacterId
          `,
        {
          $Auth0Id: auth0Id,
          $CharacterId: characterId,
        },
        (err, result: PlayerCharacter) => {
          if (err) {
            reject(err);
          } else {
            resolve(result);
          }

          console.log(err);
        }
      );
    });
  }

  public async readCharacters(auth0Id: string): Promise<PlayerCharacter[]> {
    return new Promise((resolve, reject) => {
      const results: PlayerCharacter[] = [];

      this.databaseConnection.each(
        `SELECT CharacterName,
              DexterityMod,
              LuckStone,
              AlertFeat
              IsDeleted
         FROM PlayerCharacter AS PC
        INNER JOIN User AS U
           ON U.UserId = PC.UserId
        WHERE U.Auth0Id = $auth0Id
          `,
        {
          $Auth0Id: auth0Id,
        },
        (err, row: PlayerCharacter) => {
          if (err) {
            console.log(err);
          }
          console.log(row);
          results.push(row);
        },
        (err, count) => {
          if (err) {
            reject(err);
          }

          if (count <= 0) {
            reject("Zero rows returned");
          }
          resolve(results);
        }
      );
    });
  }

  public updateCharacter(auth0Id: string, character: PlayerCharacter) {
    this.databaseConnection.run(
      `
      UPDATE PlayerCharacter
      SET 
        CharacterName = $CharacterName
        DexterityMod = $DexterityMod
      FROM (SELECT Auth0Id FROM User) AS u
      WHERE PlayerCharacterId = $PlayerCharacterId
        AND u.Auth0Id = $auth0Id
    `,
      {
        $CharacterName: character.CharacterName,
        $DexterityMod: character.DexterityMod,
        $PlayerCharacterId: character.PlayerCharacterId,
        $auth0Id: auth0Id,
      },
      (err) => {
        console.log(err);
      }
    );
  }

  public deleteCharacter(auth0Id: string, characterId: number) {
    this.databaseConnection.run(
      `
      UPDATE PlayerCharacter
         SET IsDeleted = 1
       FROM (SELECT Auth0Id FROM User) AS u
      WHERE PlayerCharacterId = $PlayerCharacterId
        AND u.Auth0Id = $auth0Id
      `,
      {
        $PlayerCharacterId: characterId,
        $Auth0Id: auth0Id,
      },
      (err) => {
        console.log(err);
        /* TODO; better error handling, less dupes */
      }
    );
  }
}
