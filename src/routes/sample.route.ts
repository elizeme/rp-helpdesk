import { Router } from "express";
import { sampleController } from "../controllers/sample/sample.controller";
const sampleRouter = Router({ mergeParams: true });

export default (router: Router): Router => {
  router.use("/sample", sampleRouter);

  sampleRouter.get("/", sampleController.getAllHandler);

  sampleRouter.post("/", sampleController.createHandler);

  sampleRouter.get("/:id", sampleController.getByIdHandler);

  sampleRouter.put("/:id", sampleController.updateHandler);

  sampleRouter.delete("/:id", sampleController.deleteByIdHandler);

  return sampleRouter;
};
