import mongoose from "mongoose";
import { ISampleDocument } from "../interfaces/sample.interface";

const SampleSchema = new mongoose.Schema(
  {
    sampleData: {
      type: String,
      required: [true, "Please add sample data"],
      trim: true,
      maxlength: [5000, "Sample data can not be more than 5000 characters"],
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

const Sample = mongoose.model<ISampleDocument>("Sample", SampleSchema);

export default Sample;
