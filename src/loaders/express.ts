import express, { Application, Response, Request, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import log from "../loggers";
import config from "config";
import routes from "../routes";
import morgan from "morgan";
import path from "path";
import { errorHandler } from "../middlewares/errorHandler";
import { StatusCodes } from "../utils/statusCodes";
import { authMiddlewares } from "../middlewares/auth";
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const rateLimit = require("express-rate-limit");
const hpp = require("hpp");
const cookieParser = require("cookie-parser");
const session = require("express-session");
// Importing file-store module
const filestore = require("session-file-store")(session);

const expressLoader = (app: Application): void => {
  app.get("/", (req: Request, res: Response) => {
    res.status(StatusCodes.SUCCESS).send(`Server is running on '/'`);
  });

  // Useful if you're behind a reverse proxy (Heroku, Bluemix, AWS ELB, Nginx, etc)
  // It shows the real origin IP in the heroku or Cloudwatch logs
  app.enable("trust proxy");

  // Helmet adds some sensible default security Headers to your app.
  app.use(helmet());

  // Sanitize data
  // app.use(mongoSanitize());

  // Prevent XSS attacks
  app.use(xss());

  // Rate limiting
  const limiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 mins
    max: 100,
  });
  app.use(limiter);

  // Prevent http param pollution
  app.use(hpp());

  // Enable Cross Origin Resource Sharing to all origins by default
  app.use(cors());

  // Set static folder
  app.use(express.static(path.join(__dirname, "public")));

  // Middleware that transforms the raw string of req.body into json
  app.use(
    express.urlencoded({
      extended: true,
    })
  );
  app.use(express.json());

  // Cookie parser
  app.use(cookieParser());

  // Dev logging middleware
  if (process.env.NODE_ENV === "development") {
    app.use(morgan("dev"));
  }

  app.use(
    session({
      name: "session-id",
      secret: "secret-session", // Secret key,
      saveUninitialized: false,
      resave: false,
      store: new filestore(),
    })
  );

  app.use(authMiddlewares.populateUser);
  app.use("/api/v1", routes());
  // catch 404 and forward to error handler
  app.use((req, res) => {
    res
      .status(StatusCodes.NOT_FOUND)
      .send({ message: "Unable to find the requested resource!" });
  });

  app.use(errorHandler);

  app.use((err: any, req: Request, res: Response) => {
    log.error(err);
    res.status(err.status || StatusCodes.INTERNAl_SERVER_ERROR);
    res.json({
      errors: {
        message: err.message,
      },
    });
  });
};

export default expressLoader;
