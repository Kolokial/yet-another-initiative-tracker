import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import sqlite3, { Database } from "sqlite3";
import { User } from "./DatabaseTypes";
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
    //this.insertUserData();
  }

  public insertUserData(auth0Id: string) {
    console.log(`inserting ${auth0Id}`);
    this.databaseConnection
      .prepare(`INSERT INTO User (Auth0Id) VALUES($auth0Id)`)
      .bind(auth0Id)
      .run((err) => {
        console.log("ran the query, now what?", err);
      });
  }

  public updateUserData(auth0Id: string, user: User) {
    /*TODO: iterate over object keys and values to construct SQL */
  }
}
