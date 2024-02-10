import mongoose from "mongoose";

export interface IClientDocument extends mongoose.Document {
  name: string;
  email: string;
  role: "client";
  permissions: Array<string>;
  createdAt: Date;
  updatedAt: Date;
}
