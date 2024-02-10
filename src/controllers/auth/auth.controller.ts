import { NextFunction, Request, Response } from "express";
import { permissionsConstants } from "../../constants/permissions";
import { dbModels } from "../../database/models";
const asyncHandler = require("express-async-handler");
const crypto = require("crypto");
import ErrorResponse from "../../utils/errorResponse";
import { StatusCodes } from "../../utils/statusCodes";
import { sendTokenResponse } from "./auth.helper";

export const authControllers = {
  registerHandler: asyncHandler(
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      const { name, email, password, permissions } = req.body;

      // Create user
      const user = await dbModels.User.create({
        name,
        email,
        password,
      });

      if (!user) {
        return next(
          new ErrorResponse(`User not created`, StatusCodes.NOT_FOUND)
        );
      }

      if (
        req.headers.role === "admin"
        // && res.locals.permissions.includes(
        // permissionsConstants.PERMISSIONS.CREATE_ADMIN)
      ) {
        const admin = await dbModels.Admin.create({
          name,
          email,
          role: "admin",
          permissions,
        });

        if (!admin) {
          return next(
            new ErrorResponse(
              `user created but admin not created`,
              StatusCodes.NOT_FOUND
            )
          );
        }
        user.role = "admin";
        user.roleData.admin = admin._id;
        await user.save();
      } else if (req.headers.role === "agent") {
        const agent = await dbModels.Agent.create({
          name,
          email,
          role: "agent",
          permissions,
        });

        if (!agent) {
          return next(
            new ErrorResponse(
              `user created but agent not created`,
              StatusCodes.NOT_FOUND
            )
          );
        }
        user.role = "agent";
        user.roleData.agent = agent._id;
        await user.save();
      } else {
        const client = await dbModels.Client.create({
          name,
          email,
          role: "client",
          permissions,
        });

        if (!client) {
          return next(
            new ErrorResponse(
              `user created but client not created`,
              StatusCodes.NOT_FOUND
            )
          );
        }
        user.role = "client";
        user.roleData.client = client._id;
        await user.save();
      }
      sendTokenResponse(user, StatusCodes.CREATED, res);
    }
  ),

  loginHandler: asyncHandler(
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      const { email, password } = req.body;
      if (!email || !password) {
        return next(
          new ErrorResponse(
            "Please provide an email and password",
            StatusCodes.BAD_REQUEST
          )
        );
      }
      // Check for user
      const user = await dbModels.User.findOne({ email }).select("+password");

      if (!user) {
        return next(
          new ErrorResponse("Invalid credentials", StatusCodes.UNAUTHORIZED)
        );
      }
      // Check if password matches
      const isMatch = await user.matchPassword(password);

      if (!isMatch) {
        return next(
          new ErrorResponse("Invalid credentials", StatusCodes.UNAUTHORIZED)
        );
      }

      sendTokenResponse(user, StatusCodes.SUCCESS, res);
    }
  ),

  // @desc      Logout
  // @route     GET /api/v1/auth/logout
  // @access    Public
  logoutHandler: asyncHandler(
    async (req: any, res: Response, next: NextFunction): Promise<void> => {
      req.session.user = null;
      req.session.role = null;
      req.session.permissions = null;

      res.cookie("token", "none", {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true,
      });

      res.status(StatusCodes.SUCCESS).send({
        message: "Logged out",
      });
    }
  ),

  // @desc      Get Me
  // @route     GET /api/v1/auth/me
  // @access    Public
  getMeHandler: asyncHandler(
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      // user is already available in req due to the protect middleware
      // const user = await dbModels.User.findById(res.locals.userId);
      const user = res.locals.user;
      const role = res.locals.role;
      let id;
      if (role == "client") {
        id = res.locals.user.roleData.client;
      } else {
        id = res.locals.user.roleData.agent.client;
      }
      const fbAccount = await dbModels.FbAccount.find({
        client: id,
        isConnected: true,
      });
      if (fbAccount.length > 0) {
        const fbUserAccessToken = fbAccount[0].userAccessToken;

        res.status(StatusCodes.SUCCESS).send({
          user,
          fbUserAccessToken,
          role,
          message: "Me",
        });
      } else {
        res.status(StatusCodes.SUCCESS).send({
          user,
          role,
          message: "Me",
        });
      }
    }
  ),

  // @desc      Update Password
  // @route     GET /api/v1/auth/updatepassword
  // @access    Public
  updatePasswordHandler: asyncHandler(
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      const user = await dbModels.User.findById(res.locals.userId).select(
        "+password"
      );
      if (!user) {
        return next(
          new ErrorResponse("Invalid credentials", StatusCodes.UNAUTHORIZED)
        );
      }

      // Check current password
      if (!(await user.matchPassword(req.body.currentPassword))) {
        return next(
          new ErrorResponse("Password is incorrect", StatusCodes.UNAUTHORIZED)
        );
      }

      user.password = req.body.newPassword;
      await user.save();

      sendTokenResponse(user, StatusCodes.SUCCESS, res);
    }
  ),

  // @desc      Forgot Password
  // @route     GET /api/v1/auth/forgotpassword
  // @access    Public
  forgotPasswordHandler: asyncHandler(
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      const user = await dbModels.User.findOne({ email: req.body.email });

      if (!user) {
        return next(
          new ErrorResponse(
            "There is no user with that email",
            StatusCodes.NOT_FOUND
          )
        );
      }

      // Get reset token
      const resetToken = user.getResetPasswordToken();
      await user.save({ validateBeforeSave: false });

      // Create reset url
      const resetUrl = `${process.env.BASE_URL}/api/v1/auth/resetpassword/${resetToken}`;

      const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please make a PUT request to: \n\n ${resetUrl}`;

      try {
        //   await sendEmail({
        //     email: user.email,
        //     subject: "Password reset token",
        //     message,
        //   });

        res
          .status(StatusCodes.SUCCESS)
          .json({ success: true, data: "Email sent", resetToken });
      } catch (err) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save({ validateBeforeSave: false });

        return next(
          new ErrorResponse(
            "Email could not be sent",
            StatusCodes.INTERNAl_SERVER_ERROR
          )
        );
      }
    }
  ),

  // @desc      Reset Password
  // @route     GET /api/v1/auth/resetpassword
  // @access    Public
  resetPasswordHandler: asyncHandler(
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      // Get hashed token
      const resetPasswordToken = crypto
        .createHash("sha256")
        .update(req.params.resettoken)
        .digest("hex");

      const user = await dbModels.User.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() },
      });

      if (!user) {
        return next(new ErrorResponse("Invalid token", StatusCodes.NOT_FOUND));
      }

      // Set new password
      user.password = req.body.password;
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();

      sendTokenResponse(user, StatusCodes.SUCCESS, res);
    }
  ),
};
