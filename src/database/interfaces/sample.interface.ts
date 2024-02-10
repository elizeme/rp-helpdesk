import mongoose from "mongoose";

export interface ISampleDocument extends mongoose.Document {
  sampleData: string;
  createdAt: Date;
  updatedAt: Date;
}
