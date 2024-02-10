import { Router } from "express";
import { permissionsConstants } from "../constants/permissions";
import { authMiddlewares } from "../middlewares/auth";
import { authControllers } from "../controllers/auth/auth.controller";
const authRouter = Router({ mergeParams: true });

export default (router: Router): Router => {
  router.use("/auth", authRouter);

  authRouter.post(
    "/register",
    // authMiddlewares.checkPermissions(
    //   permissionsConstants.PERMISSIONS.CREATE_USER
    // ),
    authControllers.registerHandler
  );

  authRouter.post("/login", authControllers.loginHandler);

  authRouter.get("/logout", authControllers.logoutHandler);

  authRouter.get(
    "/me",
    authMiddlewares.isLoggedIn,
    authControllers.getMeHandler
  );

  authRouter.put(
    "/updatepassword",
    authMiddlewares.isLoggedIn,
    authControllers.updatePasswordHandler
  );

  authRouter.post("/forgotpassword", authControllers.forgotPasswordHandler);

  authRouter.put(
    "/resetpassword/:resettoken",
    authControllers.resetPasswordHandler
  );

  return authRouter;
};
