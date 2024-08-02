import sqlite3, { Database } from "sqlite3";
import { PlayerCharacter } from "./DatabaseTypes";

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
    //this.databaseConnection.configure()
    //this.insertUserData();
  }

  public upsertUserData($auth0Id: string, $displayName: string) {
    console.log(`inserting ${$auth0Id}`);
    this.databaseConnection
      .prepare(
        `INSERT OR IGNORE 
         INTO User (Auth0Id, DisplayName) VALUES($auth0Id, $displayName)
         ON CONFLICT (Auth0Id) DO UPDATE 
         SET DisplayName = $displayName
         WHERE Auth0Id = $auth0Id`
      )
      .bind($auth0Id, $displayName)
      .run((err) => {
        console.log("ran the query, now what?", err);
      });
  }

  public readCharacter(auth0Id: string, characterId: number) {
    this.databaseConnection.run(
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
      (err) => {
        console.log(err);
      }
    );
  }

  public async readCharacters(auth0Id: string) {
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
        }
      );
    });
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
