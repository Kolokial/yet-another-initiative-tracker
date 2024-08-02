import e, { Express, Request, Response } from "express";
import { DatabaseSetup } from "../database/DatabaseSetup";

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
    res.send(`{"good": "job"}`);
  });
  app.post("/api/user", checkJwt, (req: Request, res: Response) => {
    console.log(`req.body = ` + JSON.stringify(req.body));
    console.log(`Header: ${req.auth?.payload.sub}`);
    /* TODO: Can remove the auth0Id from body and just use req.auth.payload.sub */
    database.upsertUserData(req.body.auth0Id, req.body.displayName);
    /* TODO: send back userId */
    res.send("null");
    res.status(201).end();
  });
  app.patch("/api/user/", checkJwt, (req: Request, res: Response) => {
    database.upsertUserData(req.headers.authorization as string, req.body);
    res.status(200).end();
  });
  app.get(`/api/user`, checkJwt, (req, res) => {
    console.log(req);
    res.send("test");
  });
}
