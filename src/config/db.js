import mongoose from "mongoose";
import { ENV } from "./env.js";

export const connectDB = async () => {
  try {
    const connect = await mongoose.connect(ENV.MONGO_DB_URL);
    console.log("connected to the database", connect.connection.host);
  } catch (error) {
    console.log("error connecting the database", error);
    process.exit(1);
  }
};
