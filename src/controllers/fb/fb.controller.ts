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
import fbService from "../../services/axios/fb";
import { handleRecievingMessage, handleSendMessage } from "./fb.utils";

export const fbController = {
  verify: asyncHandler(
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      const mode = req.query["hub.mode"];
      const verify_token = req.query["hub.verify_token"];
      const challenge = req.query["hub.challenge"];
      if (mode && verify_token) {
        if (mode === "subscribe" && verify_token === "elizeme2022") {
          res.status(StatusCodes.SUCCESS).send(challenge);
        }
      } else {
      }
    }
  ),

  connectFbAccount: asyncHandler(
    async (req: Request, res: Response, next: NextFunction): Promise<any> => {
      const user = res.locals.user;
      const fbAccount = await dbModels.FbAccount.find({
        client: user.roleData.client._id,
      });
      if (fbAccount.length > 0) {
        const pages = await fbService.getPages(
          req.body.fbUserId,
          req.body.fbAccessToken
        );
        fbAccount[0].isConnected = true;
        fbAccount[0].userAccessToken = req.body.fbAccessToken;
        fbAccount[0].fbUserId = req.body.fbUserId;
        fbAccount[0].pageId = pages && pages.length > 0 && pages[0].id;
        fbAccount[0].pageAccessToken =
          pages && pages.length > 0 && pages[0].access_token;
        fbAccount[0].pageName = pages && pages.length > 0 && pages[0].name;
        fbAccount[0].save();
        return res
          .status(StatusCodes.SUCCESS)
          .send({ success: true, message: "All samples" });
      } else {
        const pages = await fbService.getPages(
          req.body.fbUserId,
          req.body.fbAccessToken
        );

        const gfa = await fbService.generateFeedAccess(pages);
        const fba = await dbModels.FbAccount.create({
          page: pages && pages.length > 0 && pages[0].id,
          email: user.email,
          client: user.roleData.client._id,
          userAccessToken: req.body.fbAccessToken,
          fbUserId: req.body.fbUserId,
          isConnected: true,
          pageId: pages && pages.length > 0 && pages[0].id,
          pageAccessToken: pages && pages.length > 0 && pages[0].access_token,
          pageName: pages && pages.length > 0 && pages[0].name,
        });
        return res
          .status(StatusCodes.SUCCESS)
          .send({ success: true, message: "All samples" });
      }
      return res
        .status(StatusCodes.SUCCESS)
        .send({ success: true, message: "All samples" });
    }
  ),

  disconnectFbAccount: asyncHandler(
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      const user = res.locals.user;
      const fbAccount = await dbModels.FbAccount.find({
        client: user.roleData.client._id,
      });
      fbAccount[0].isConnected = false;
      fbAccount[0].userAccessToken = "";
      fbAccount[0].fbUserId = "";
      fbAccount[0].save();
      res
        .status(StatusCodes.SUCCESS)
        .send({ success: true, message: "All samples" });
    }
  ),

  getCustomerData: asyncHandler(
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        const accessToken = req.body.accessToken;
        const { id } = req.params;
        // const fbAccount = await dbModels.FbAccount.find({ customerId: id });

        // const accessToken =
        //   fbAccount && fbAccount[0] && fbAccount[0].userAccessToken;
        const t = await fbService.getCustomer(id, accessToken);
        res
          .status(StatusCodes.SUCCESS)
          .send({ customer: t, message: "All samples" });
      } catch (err) {
        console.log("err", err);
        res.status(StatusCodes.SUCCESS).send({
          message: "All samples",
        });
      }
    }
  ),

  allConversations: asyncHandler(
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      const { pageId } = req.params;
      const conv = await dbModels.Messenger.find({ pageId });
      res.status(StatusCodes.SUCCESS).send({ conv });
    }
  ),

  getConversation: asyncHandler(
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      const { conversationId } = req.params;
      const conv = await dbModels.Conversation.findById(conversationId);
      const messenger = await dbModels.Messenger.find({
        conversation: conversationId,
      });
      messenger[0].isRead = true;
      messenger[0].save();
      res.status(StatusCodes.SUCCESS).send({ conv });
    }
  ),

  recieveMessage: asyncHandler(
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        const body = req.body;

        if (body.entry[0] && body.entry[0].messaging) {
          const message = body.entry[0].messaging[0];
          console.log("asjsa", body);
          console.log("mekjasjsa", body.entry);
          console.log("mnjknanmnadsnmnas", body.entry[0]);
          await handleRecievingMessage(message);
        }
        res.status(StatusCodes.SUCCESS).send({ message: "All samples" });
      } catch (err) {
        console.log("ee:", err);
        res.status(StatusCodes.SUCCESS).send({ message: "All samples" });
      }
    }
  ),

  sendMessage: asyncHandler(
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      const { client, pageId, customerId, messageText } = req.body;
      const fbAccount = await dbModels.FbAccount.find({ client: client });
      const pages = await fbService.getPages(
        fbAccount[0].fbUserId,
        fbAccount[0].userAccessToken
      );
      const pageFilter = pages.filter((page: any) => page.id == pageId);
      const msgFormat = {
        recipient: {
          id: customerId,
        },
        messaging_type: "RESPONSE",
        message: {
          text: messageText,
        },
      };

      const sentMsg = await fbService.sendOnMessenger(
        msgFormat,
        pageId,
        pageFilter[0].access_token
      );
      const message = {
        text: messageText,
        mid: sentMsg.message_id,
      };
      await handleSendMessage(client, pageId, customerId, message);
      res.status(StatusCodes.SUCCESS).send({ message: "All samples" });
    }
  ),

  userDetails: asyncHandler(
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      const user = await fbService.getUserDetails();
      if (!user) {
        return next(new ErrorResponse(`user not found`, StatusCodes.NOT_FOUND));
      }
      res.status(StatusCodes.SUCCESS).send({ user, message: "All samples" });
    }
  ),

  appAccessToken: asyncHandler(
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      const accessToken = await fbService.getAppAccessToken();
      if (!accessToken) {
        return next(
          new ErrorResponse(`accessToken not found`, StatusCodes.NOT_FOUND)
        );
      }
      res
        .status(StatusCodes.SUCCESS)
        .send({ accessToken, message: "All samples" });
    }
  ),

  getFbAccount: asyncHandler(
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      const client = req.query.client;
      const fbAccount = await dbModels.FbAccount.find({ client: client });
      if (!fbAccount) {
        return next(
          new ErrorResponse(`fbAccount not found`, StatusCodes.NOT_FOUND)
        );
      }
      res
        .status(StatusCodes.SUCCESS)
        .send({ fbAccount, message: "All samples" });
    }
  ),

  getPages: asyncHandler(
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      let id;
      if (res.locals.role === "agent") {
        id = res.locals.user.roleData.agent.client;
      } else if (res.locals.role === "client") {
        id = res.locals.user.roleData.client._id;
      }
      const fbAccount: any = await dbModels.FbAccount.find({
        client: id,
      });

      // const pages: any = [
      //   {
      //     id: fbAccount[0].pageId,
      //     access_token: fbAccount[0].pageAccessToken,
      //     pageName: fbAccount[0].pageName,
      //   },
      // ];
      // const pages = await fbService.getPages(
      //   fbAccount[0].fbUserId,
      //   fbAccount[0].userAccessToken
      // );
      // if (!pages) {
      //   return next(
      //     new ErrorResponse(`Pages not found`, StatusCodes.NOT_FOUND)
      //   );
      // }
      const pages = {
        id: fbAccount[0].pageId,
        access_token: fbAccount[0].pageAccessToken,
        pageName: fbAccount[0].pageName,
      };
      res.status(StatusCodes.SUCCESS).send({ pages, message: "All samples" });
    }
  ),
};
