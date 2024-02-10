import mongoose from "mongoose";
import { IClientDocument } from "./client.interface";

export interface IFbAccountDocument extends mongoose.Document {
  client: IClientDocument["_id"];
  email: string;
  userAccessToken: string;
  fbUserId: string;
  pageId: string;
  pageAccessToken: string;
  pageName: string;
  isConnected: boolean;
  createdAt: Date;
  updatedAt: Date;
}
