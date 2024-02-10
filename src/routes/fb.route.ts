import { Router } from "express";
import { permissionsConstants } from "../constants/permissions";
import { fbController } from "../controllers/fb/fb.controller";
import { authMiddlewares } from "../middlewares/auth";
const fbRouter = Router({ mergeParams: true });

export default (router: Router): Router => {
  router.use("/fb", fbRouter);

  fbRouter.get("/verify", fbController.verify);

  fbRouter.post("/verify", fbController.recieveMessage);

  fbRouter.post(
    "/connect",
    authMiddlewares.isLoggedIn,
    fbController.connectFbAccount
  );

  fbRouter.post(
    "/disconnect",
    authMiddlewares.isLoggedIn,
    fbController.disconnectFbAccount
  );

  fbRouter.get("/messenger/:pageId", fbController.allConversations);

  fbRouter.get("/conversation/:conversationId", fbController.getConversation);

  fbRouter.post("/messenger/send", fbController.sendMessage);

  fbRouter.get("/customer/:id", fbController.getCustomerData);

  fbRouter.get("/user", fbController.userDetails);

  fbRouter.get("/app-access-token", fbController.appAccessToken);

  fbRouter.get("/pages", authMiddlewares.isLoggedIn, fbController.getPages);

  fbRouter.get("/fb-account", fbController.getFbAccount);

  return fbRouter;
};
