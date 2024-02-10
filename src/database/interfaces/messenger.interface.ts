import mongoose from "mongoose";
import { IClientDocument } from "./client.interface";
import { IConversationDocument } from "./conversation.interface";

export interface IMessengerDocument extends mongoose.Document {
  conversation: IConversationDocument["_id"];
  client: IClientDocument["_id"];
  pageId: string;
  customerId: string;
  customerName: string;
  lastMessage: string;
  isCustomerMsg: boolean;
  convType: string;
  lastMessageTimestamp: Date;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}
