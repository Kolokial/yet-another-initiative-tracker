import { Express, Request, Response } from "express";

export function setupRoutes(app: Express) {
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
      "X-Requested-With,content-type"
    );

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader("Access-Control-Allow-Credentials", "true");

    // Pass to next layer of middleware
    next();
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
  app.get("/api/user/:id", (req: Request, res: Response) => {
    console.log(`Header: ${req.headers.authorization}`);
    res.send();
  });
  app.get(`/api/user`, (req, res) => {
    console.log(req);
    res.send("test");
  });
}
