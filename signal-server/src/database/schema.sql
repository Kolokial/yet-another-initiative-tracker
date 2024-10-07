CREATE TABLE IF NOT EXISTS User(
  UserId INTEGER PRIMARY KEY,
  Auth0Id TEXT NOT NULL UNIQUE,
  DisplayName TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS PlayerCharacter2(
    PlayerCharacterId INTEGER PRIMARY KEY,
    UserId INT NOT NULL,
    CharacterName TEXT NOT NULL,
    DexterityMod INTEGER DEFAULT 0,
    LuckStone INTEGER DEFAULT 0, -- Bool, defaults to false
    AlertFeat INTEGER DEFAULT 0, -- Bool, defaults to false
    IsInPlay INTEGER DEFAULT 0, -- Bool, defaults to false
    IsDeleted INTEGER DEFAULT 0,
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