import { Express, Request, Response } from "express";
import { auth } from "express-oauth2-jwt-bearer";
import { DatabaseSetup } from "./database/DatabaseSetup";
import { setupUserRoutes } from "./routes/user.routes.js";
import { setupCharacterRoutes } from "./routes/character.routes.js";

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
  setupUserRoutes(app, database, checkJwt);
  setupCharacterRoutes(app, database, checkJwt);
}
