import mongoose from "mongoose";
import { config } from "../envConfig.js";

export const connDb = async () => {
  try {
    const conn = await mongoose.connect(config.db);
    console.log(`Now connected to db!`);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`Failed to connect to DB:`, errorMessage);
    process.exit(1);
  }
};
