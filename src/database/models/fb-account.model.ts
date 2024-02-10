import mongoose from "mongoose";
import { IFbAccountDocument } from "../interfaces/fb-account.interface";

const FbAccountSchema = new mongoose.Schema(
  {
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
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client",
    },
    pageId: { type: String },
    userAccessToken: {
      type: String,
    },
    fbUserId: {
      type: String,
    },
    isConnected: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

const FbAccount = mongoose.model<IFbAccountDocument>(
  "FbAccount",
  FbAccountSchema
);

export default FbAccount;
