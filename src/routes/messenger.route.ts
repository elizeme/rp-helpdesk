import { Router } from "express";
import { permissionsConstants } from "../constants/permissions";
import { fbController } from "../controllers/fb/fb.controller";
const messengerRouter = Router({ mergeParams: true });

export default (router: Router): Router => {
  router.use("/messenger", messengerRouter);

  return messengerRouter;
};
