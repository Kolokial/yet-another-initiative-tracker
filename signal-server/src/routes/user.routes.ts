import e, { Express, Request, Response } from "express";
import { DatabaseSetup } from "../database/DatabaseSetup";
import { User } from "@shared-types/User";

export function setupUserRoutes(
  app: Express,
  database: DatabaseSetup,
  checkJwt: e.Handler
) {
  /**
   * @swagger
   * /api/resource:
   * get:
   *  summary: Get a resource
   *  description: Get a specific resource by ID.
   *  parameters:
   * — in: path
   * name: id
   * required: true
   * description: ID of the resource to retrieve.
   * schema:
   * type: string
   * responses:
   * 200:
   * description: Successful response
   */
  app.get("/api/user", checkJwt, (req: Request, res: Response) => {
    console.log(`Header: ${req.headers.authorization}`);
    database
      .readUser(req.auth?.payload.sub as string)
      .catch((reason) => {
        res.send("null");
        res.status(404);
      })
      .then((user: User | void) => {
        console.log("at the routes level", user);
        res.send(JSON.stringify(user));
        res.status(200);
      });
  });
  app.post("/api/user", checkJwt, (req: Request, res: Response) => {
    console.log(`req.body = ` + JSON.stringify(req.body));
    console.log(`Header: ${req.auth?.payload.sub}`);
    /* TODO: Can remove the auth0Id from body and just use req.auth.payload.sub */
    database.upsertUser(req.auth?.payload.sub as string, req.body.DisplayName);
    /* TODO: send back userId */
    res.send("null");
    res.status(201).end();
  });
  app.patch("/api/user/", checkJwt, (req: Request, res: Response) => {
    database.upsertUser(req.auth?.payload.sub as string, req.body.DisplayName);
    res.status(200).end();
  });
  app.get(`/api/user`, checkJwt, (req, res) => {
    console.log(req);
    res.send("test");
  });
}
