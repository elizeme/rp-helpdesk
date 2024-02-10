import mongoose from "mongoose";
import { IClientDocument } from "./client.interface";

export interface IAgentDocument extends mongoose.Document {
  name: string;
  email: string;
  role: "agent";
  client: IClientDocument["_id"];
  permissions: Array<string>;
  createdAt: Date;
  updatedAt: Date;
}
