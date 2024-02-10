import mongoose from "mongoose";
import { IClientDocument } from "../interfaces/client.interface";

const ClientSchema = new mongoose.Schema(
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
      enum: ["client"],
      default: "Client",
    },
    permissions: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

const Client = mongoose.model<IClientDocument>("Client", ClientSchema);

export default Client;
