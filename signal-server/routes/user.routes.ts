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
  app.get("/api/user/:id", checkJwt, (req: Request, res: Response) => {
    console.log(`Header: ${req.headers.authorization}`);
    res.send(`{"good": "job"}`);
  });
  app.post("/api/user", checkJwt, (req: Request, res: Response) => {
    console.log(`req.body = ` + JSON.stringify(req.body));
    database.insertUserData(req.body.auth0Id, req.body.displayName);
    /* TODO: send back userId */
    res.send("null");
    res.status(201).end();
  });
  app.patch("/api/user/:id", checkJwt, (req: Request, res: Response) => {
    database.updateUserData(req.params.id, req.body);
    res.status(200).end();
  });
  app.get(`/api/user`, checkJwt, (req, res) => {
    console.log(req);
    res.send("test");
  });
}
