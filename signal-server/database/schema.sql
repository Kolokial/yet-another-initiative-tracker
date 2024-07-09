
CREATE TABLE IF NOT EXISTS User(
  UserId INTEGER PRIMARY KEY,
  Auth0Id TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS PlayerCharacter(
    PlayerCharacterId INTEGER PRIMARY KEY,
    UserId TEXT NOT NULL,
    CharacterName TEXT NOT NULL,
    DexterityMod INTEGER NULL,
    FOREIGN KEY(UserId) REFERENCES User(UserId)
);

CREATE TABLE IF NOT EXISTS Room(
    RoomId TEXT NOT NULL
    --RoomName TEXT NOT NULL, -- Not implemented yet.
);

CREATE TABLE IF NOT EXISTS PlayerCharacterDiceRoll(
    PlayerCharacterId INTEGER,
    RoomId TEXT NOT NULL,
    DiceRoll INTEGER,

    FOREIGN KEY (PlayerCharacterId) REFERENCES PlayerCharacter(PlayerCharacterId),
    FOREIGN KEY (RoomId) REFERENCES Room(RoomId)
);