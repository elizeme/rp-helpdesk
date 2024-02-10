import { Application } from "express";
import log from "../loggers";
import expressLoader from "./express";
import mongooseLoader from "./mongoose";

export default async function (app: Application): Promise<void> {
  await expressLoader(app);
  log.info(`Express App Loaded`.yellow);

  await mongooseLoader();
  log.info(`Mongoose Db Loaded`.yellow);
}
