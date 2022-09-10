import express, { Request, Response } from "express";
import dotenv from "dotenv";
dotenv.config();
import cors from 'cors';
import cookieParser from 'cookie-parser';
import router from "./routes/index.js";
import connect from "./utils/connect.utils.js";
import logger from "./utils/logger.utils.js";
import deserializeUser from "./middleware/deserializeUser.js";

//TODO Metrics
//TODO Swagger

const port = parseInt(process.env.port as string);
const app = express();


app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(deserializeUser);
app.use(router);




app.listen(port, async () => {
  logger.info(`App is running at http://localhost:${port}`);

  await connect();

 
});

