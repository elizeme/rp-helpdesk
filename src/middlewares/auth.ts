import { NextFunction, Request, Response } from "express";
import { dbModels } from "../database/models";
import ErrorResponse from "../utils/errorResponse";
import { StatusCodes } from "../utils/statusCodes";
const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");

// Protect routes
export const authMiddlewares = {
  populateUser: asyncHandler(
    async (req: any, res: Response, next: NextFunction): Promise<void> => {
      let token;
      if (req.session.user) {
        res.locals.user = req.session.user;
        res.locals.role = req.session.role;
        res.locals.permissions = req.session.permissions;
        return next();
      }
      if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
      ) {
        // Set token from Bearer token in header
        token = req.headers.authorization.split(" ")[1];
      } else if (req.cookies.token) {
        token = req.cookies.token;
      } else {
        return next();
      }

      try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (!decoded) {
          return next();
        }
        const id = decoded.id;
        const user = await dbModels.User.findById(id).populate({
          path: "roleData",
          populate: [
            {
              path: "admin",
              model: "Admin",
            },
            {
              path: "client",
              model: "Client",
            },
            {
              path: "agent",
              model: "Agent",
            },
          ],
        });
        res.locals.user = user;
        if (user && user.role === "admin") {
          res.locals.role = user.roleData.admin.role;
          res.locals.permissions = user.roleData.admin.permissions;
        } else if (user && user.role === "client") {
          res.locals.role = user.roleData.client.role;
          res.locals.permissions = user.roleData.client.permissions;
        } else if (user) {
          res.locals.role = user.roleData.agent.role;
          res.locals.permissions = user.roleData.agent.permissions;
        }
        req.session.user = user;
        req.session.role = res.locals.role;
        req.session.permissions = res.locals.permissions;
      } catch (err) {
        console.log("🚀🚀🚀🚀 ~ file: auth.ts:53 ~ err:", err);
      }
      next();
    }
  ),

  isLoggedIn: asyncHandler(
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      if (res.locals.user) {
        next();
      } else {
        throw new ErrorResponse("Not logged in", StatusCodes.UNAUTHORIZED);
      }
    }
  ),

  isAdmin: asyncHandler(
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      if (res.locals.user && res.locals.role === "admin") {
        next();
      } else {
        throw new ErrorResponse("Not an admin", StatusCodes.UNAUTHORIZED);
      }
    }
  ),

  isClient: asyncHandler(
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      if (res.locals.user && res.locals.role === "client") {
        next();
      } else {
        throw new ErrorResponse("Not an client", StatusCodes.UNAUTHORIZED);
      }
    }
  ),

  isAgent: asyncHandler(
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      if (res.locals.user && res.locals.role === "agent") {
        next();
      } else {
        throw new ErrorResponse("Not an agent", StatusCodes.UNAUTHORIZED);
      }
    }
  ),

  checkPermissions: (permissions: any) => {
    return (req: Request, res: Response, next: NextFunction) => {
      if (typeof permissions === "string") {
        permissions = [permissions];
      }

      const userPermissions = res.locals.permissions;
      for (let permission of permissions) {
        if (!userPermissions.includes(permission)) {
          throw new ErrorResponse(
            `No permission to ${permission}`,
            StatusCodes.UNAUTHORIZED
          );
        }
      }
      return next();
    };
  },
};
