import e, { Express, Request, Response } from "express";
import { DatabaseSetup } from "../database/DatabaseSetup";

export function setupCharacterRoutes(
  app: Express,
  database: DatabaseSetup,
  checkJwt: e.Handler
) {
  app.get(
    "/api/user/:id/characters",
    checkJwt,
    (req: Request, res: Response) => {
      console.log(`Header: ${req.headers.authorization}`);
      res.send(`{"good": "job"}`);
    }
  );
  app.get(
    "/api/user/:id/character/:characterId",
    checkJwt,
    (req: Request, res: Response) => {
      console.log(`Header: ${req.headers.authorization}`);
      res.send(`{"good": "job"}`);
    }
  );

  app.post(
    "/api/user/:id/character",
    checkJwt,
    (req: Request, res: Response) => {
      console.log(`req.body = ` + JSON.stringify(req.body));
      database.createCharacter(req.body.auth0Id, req.body);
      /* TODO: send back userId */
      res.send("null");
      res.status(201).end();
    }
  );
  app.patch(
    "/api/user/:id/character/:characterId",
    checkJwt,
    (req: Request, res: Response) => {
      database.updateUserData(req.params.id, req.body);
      res.status(200).end();
    }
  );
  app.get(`/api/user`, checkJwt, (req, res) => {
    console.log(req);
    res.send("test");
  });
}
