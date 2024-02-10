import { Router } from "express";
import authRoute from "./auth.route";
import sampleRoute from "./sample.route";
import fbRoute from "./fb.route";
import messengerRoute from "./messenger.route";

export default (): Router => {
  const router: Router = Router();
  authRoute(router);
  fbRoute(router);
  messengerRoute(router);
  sampleRoute(router);
  return router;
};
