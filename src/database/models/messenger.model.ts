import mongoose from "mongoose";
import { IMessengerDocument } from "../interfaces/messenger.interface";

const MessengerSchema = new mongoose.Schema(
  {
    conversation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
    },
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client",
      // type: String,
    },
    pageId: {
      type: String,
    },
    customerId: {
      type: String,
    },
    lastMessage: { type: String },
    customerName: { type: String },
    isCustomerMsg: { type: Boolean },
    convType: { type: String },
    isRead: { type: Boolean },
    lastMessageTimestamp: { type: Date },
    isConvEnded: { type: Boolean, default: false },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

const Messenger = mongoose.model<IMessengerDocument>(
  "Messenger",
  MessengerSchema
);

export default Messenger;
