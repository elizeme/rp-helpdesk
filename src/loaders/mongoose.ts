import mongoose from "mongoose";
import { Db } from "mongoose/node_modules/mongodb";

export default async function (): Promise<Db> {
  const dbUri = process.env.MONGO_URI as string;
  const connection = await mongoose.connect(dbUri, {});
  return connection.connection.db;
}
