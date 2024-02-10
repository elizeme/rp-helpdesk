import mongoose from "mongoose";
import { IAgentDocument } from "../interfaces/agent.interface";

const AgentSchema = new mongoose.Schema(
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
      enum: ["agent"],
      default: "Agent",
    },
    client: { type: mongoose.Schema.Types.ObjectId, ref: "Client" },
    permissions: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

const Agent = mongoose.model<IAgentDocument>("Agent", AgentSchema);

export default Agent;
