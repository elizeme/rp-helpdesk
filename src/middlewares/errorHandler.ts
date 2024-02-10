import { NextFunction, Request, Response } from "express";
import ErrorResponse from "../utils/errorResponse";
import { StatusCodes } from "../utils/statusCodes";

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let error = { ...err };

  error.message = err.message;

  // Log to console for dev
  console.log(err);

  // Mongoose bad ObjectId
  if (err.name === "CastError") {
    const message = `Resource not found`;
    error = new ErrorResponse(message, StatusCodes.NOT_FOUND);
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const message = "Duplicate field value entered";
    error = new ErrorResponse(message, StatusCodes.BAD_REQUEST);
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const message = Object.values(err.errors).map((val: any) => val.message);
    error = new ErrorResponse(message, StatusCodes.BAD_REQUEST);
  }

  res.status(error.statusCode || StatusCodes.INTERNAl_SERVER_ERROR).json({
    success: false,
    message: error.message || "Server Error",
  });
};
