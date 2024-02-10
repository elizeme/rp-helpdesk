import mongoose from "mongoose";
import { IAdminDocument } from "./admin.interface";
import { IClientDocument } from "./client.interface";
import { IAgentDocument } from "./agent.interface";

export interface IUserDocument extends mongoose.Document {
  name: string;
  email: string;
  role: "client" | "agent" | "admin";
  roleData: {
    admin?: IAdminDocument["_id"];
    agent?: IAgentDocument["_id"];
    client?: IClientDocument["_id"];
  };
  password: string;
  profilePhoto: string;
  resetPasswordToken: string | undefined;
  resetPasswordExpire: Date | undefined;
  matchPassword: (password: string) => Promise<boolean>;
  getResetPasswordToken: () => string;
  createdAt: Date;
  updatedAt: Date;
}
