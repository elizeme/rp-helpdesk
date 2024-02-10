import mongoose from "mongoose";

export interface IAdminDocument extends mongoose.Document {
  name: string;
  email: string;
  role: "admin";
  permissions: Array<string>;
  createdAt: Date;
  updatedAt: Date;
}
