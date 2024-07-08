import sqlite3, { Database } from "sqlite3";

export class Data {
  private databaseConnection: Database;

  constructor() {
    this.databaseConnection = new sqlite3.Database(
      "./database/myTestDatabase.db",
      sqlite3.OPEN_READWRITE,
      (err) => {
        console.log("there was a problem opening the db.");
      }
    );
    this.insertUserData();
  }

  public insertUserData() {
    this.databaseConnection
      .prepare(`INSERT INTO User (UserId, Auth0Id) VALUES(null, $UserId)`)
      .bind("myUserId");
  }
}
