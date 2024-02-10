import mongoose from "mongoose";
import { IClientDocument } from "./client.interface";

export type IMessageDocument = {
  from: string;
  isCustomerMessage: boolean;
  messageBody: string;
  timestamp: Date;
  isFirst: boolean;
};

export interface IConversationDocument extends mongoose.Document {
  client: IClientDocument["_id"];
  pageId: string;
  customerId: string;
  messages: Array<IMessageDocument>;
  convType: string;
  lastMessageTimestamp: Date;
  isConvEnded: boolean;
  customerName: string;
  customerProfilePic: string;
  createdAt: Date;
  updatedAt: Date;
}
