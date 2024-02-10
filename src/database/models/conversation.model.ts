import mongoose from "mongoose";
import { IConversationDocument } from "../interfaces/conversation.interface";

const Message = new mongoose.Schema({
  from: {
    type: String,
  },
  isCustomerMessage: {
    type: Boolean,
  },
  messageBody: {
    type: String,
  },
  timestamp: {
    type: Date,
  },
  isFirst: { type: Boolean },
});

const ConversationSchema = new mongoose.Schema(
  {
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
    customerName: {
      type: String,
    },
    customerProfilePic: {
      type: String,
    },
    messages: { type: [Message] },
    convType: { type: String },
    lastMessageTimestamp: { type: Date },
    isConvEnded: { type: Boolean, default: false },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

const Conversation = mongoose.model<IConversationDocument>(
  "Conversation",
  ConversationSchema
);

export default Conversation;
