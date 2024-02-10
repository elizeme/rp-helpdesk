import mongoose from "mongoose";
import { IAdminDocument } from "../interfaces/admin.interface";

const AdminSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please add user name"],
      trim: true,
      maxlength: [50, "Name can not be more than 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Please add an email"],
      unique: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please add a valid email",
      ],
    },
    role: {
      type: String,
      enum: ["admin"],
      default: "admin",
    },
    permissions: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

const Admin = mongoose.model<IAdminDocument>("Admin", AdminSchema);

export default Admin;
