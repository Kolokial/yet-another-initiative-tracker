import e, { Express, Request, Response } from "express";
import { DatabaseSetup } from "../database/DatabaseSetup";

export function setupCharacterRoutes(
  app: Express,
  database: DatabaseSetup,
  checkJwt: e.Handler
) {
  app.get("/api/user/characters", checkJwt, (req: Request, res: Response) => {
    console.log(`Header: ${req.headers.authorization}`);
    database
      .readCharacters(req.auth?.payload.sub as string)
      .then((playerCharacters) => {
        res.send(JSON.stringify(playerCharacters));
      });
  });
  app.get(
    "/api/user/:id/character/:characterId",
    checkJwt,
    (req: Request, res: Response) => {
      console.log(`Header: ${req.headers.authorization}`);
      database
        .readCharacter(
          req.auth?.payload.sub as string,
          req.params.characterId as string
        )
        .then((playerCharacter) => {
          res.send(JSON.stringify(playerCharacter));
        });
    }
  );

  app.post("/api/user/character", checkJwt, (req: Request, res: Response) => {
    console.log(`req.body = ` + JSON.stringify(req.body));
    database.createCharacter(req.auth?.payload.sub as string, req.body);
    /* TODO: send back userId */
    res.send("null");
    res.status(201).end();
  });
  app.patch(
    "/api/user/character/:characterId",
    checkJwt,
    (req: Request, res: Response) => {
      database.updateCharacter(req.auth?.payload.sub as string, req.body);
      res.status(200).end();
    }
  );

  app.delete(
    "api/user/character/:characterId",
    checkJwt,
    (req: Request, res: Response) => {
      database.deleteCharacter(req.auth?.payload.sub as string, req.body);
      res.status(200).end();
    }
  );
  app.get(`/api/user`, checkJwt, (req, res) => {
    console.log(req);
    res.send("test");
  });
}
