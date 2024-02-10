import { NextFunction, Request, Response } from "express";
const asyncHandler = require("express-async-handler");
import { get } from "lodash";
import {
  getAllResources,
  getResourceById,
} from "../../services/CRUD/resource-crud.service";
import ErrorResponse from "../../utils/errorResponse";
import { StatusCodes } from "../../utils/statusCodes";
import { dbModels } from "../../database/models";

export const sampleController = {
  getAllHandler: asyncHandler(
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      const samples = await getAllResources(dbModels.Sample, req.query, null);
      if (!samples) {
        return next(
          new ErrorResponse(`sample not found`, StatusCodes.NOT_FOUND)
        );
      }
      res.status(StatusCodes.SUCCESS).send({ samples, message: "All samples" });
    }
  ),

  createHandler: asyncHandler(
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      const body = get(req, "body");
      const sample = await dbModels.Sample.create({
        ...body,
      });
      if (!sample) {
        return next(
          new ErrorResponse(`sample not created`, StatusCodes.NOT_FOUND)
        );
      }
      res.status(StatusCodes.CREATED).send({ sample, message: "sample by id" });
    }
  ),

  getByIdHandler: asyncHandler(
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      const sample = await getResourceById(
        dbModels.Sample,
        req.params.id,
        req.query,
        { path: "sampleData", select: "name slug" }
      );
      if (!sample) {
        return next(
          new ErrorResponse(
            `sample not found with id of ${req.params.id}`,
            StatusCodes.NOT_FOUND
          )
        );
      }
      res.status(StatusCodes.SUCCESS).json({ success: true, sample });
    }
  ),

  updateHandler: asyncHandler(
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      const { sampleData } = req.body;
      const sample = await dbModels.Sample.findByIdAndUpdate(
        req.params.id,
        {
          sampleData,
        },
        { new: true }
      );

      res
        .status(StatusCodes.SUCCESS)
        .send({ sample, message: "sample updated" });
    }
  ),

  deleteByIdHandler: asyncHandler(
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      const sample = await dbModels.Sample.findByIdAndDelete(req.params.id);

      res.status(StatusCodes.SUCCESS).send({
        sample,
        message: "sample Deleted",
      });
    }
  ),
};
