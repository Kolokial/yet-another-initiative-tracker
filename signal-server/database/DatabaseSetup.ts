import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import sqlite3, { Database } from "sqlite3";
import { PlayerCharacter, User } from "./DatabaseTypes";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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

  public insertUserData($auth0Id: string, $displayName: string) {
    console.log(`inserting ${$auth0Id}`);
    this.databaseConnection
      .prepare(
        `INSERT INTO User (Auth0Id, DisplayName) VALUES($auth0Id, $displayName)`
      )
      .bind($auth0Id, $displayName)
      .run((err) => {
        console.log("ran the query, now what?", err);
      });
  }

  public updateUserData(auth0Id: string, user: User) {
    console.log(user, user.DisplayName);
    if (user.DisplayName) {
      this.databaseConnection.run(
        `UPDATE User SET DisplayName = $user WHERE Auth0Id = $auth0Id`,
        { $user: user.DisplayName, $auth0Id: auth0Id },
        (err) => {
          console.log("ran the query, now what?", err);
        }
      );
    }
    /*TODO: iterate over object keys and values to construct SQL */
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
}
