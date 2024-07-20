import { Express, Request, Response } from "express";
import { auth } from "express-oauth2-jwt-bearer";
import { DatabaseSetup } from "./database/DatabaseSetup";

export function setupRoutes(app: Express, database: DatabaseSetup) {
  app.use(function (req, res, next) {
    // Website you wish to allow to connect
    res.setHeader("Access-Control-Allow-Origin", "http://localhost:4200");

    // Request methods you wish to allow
    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET, POST, OPTIONS, PUT, PATCH, DELETE"
    );

    // Request headers you wish to allow
    res.setHeader(
      "Access-Control-Allow-Headers",
      "X-Requested-With,content-type,Authorization"
    );

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader("Access-Control-Allow-Credentials", "true");

    // Pass to next layer of middleware
    next();
  });
  const checkJwt = auth({
    audience: "yait",
    issuerBaseURL: `https://dev-sulaeis36e3ik0p1.us.auth0.com`,
  });
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
    database.insertUserData(req.body.auth0Id);
    /* TODO: send back userId */
    res.send("null");
    res.status(201).end();
  });
  app.patch("/api/user/:id", checkJwt, (req: Request, res: Response) => {
    database.updateUserData(req.params.id, req.body);
  });
  app.get(`/api/user`, checkJwt, (req, res) => {
    console.log(req);
    res.send("test");
  });
}
