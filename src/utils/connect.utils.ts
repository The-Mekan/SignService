import mongoose, { ConnectOptions } from "mongoose";
import logger from "./logger.utils.js";

async function connect() {
  let dbUri = process.env.dbUri as string;
  

  try {
    await mongoose.connect(dbUri, {
      dbName:'mekan',
      useNewUrlParser: true
    } as ConnectOptions);
    logger.info("DB connected");
  } catch (error) {
    logger.error("Could not connect to db");
    process.exit(1);
  }
}

export default connect;
