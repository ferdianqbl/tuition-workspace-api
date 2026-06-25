import { globalErrorHandler } from "@/middlewares/error.middleware";
import compression from "compression";
import cookieParser from "cookie-parser";
import cors from "cors";
import "dotenv/config";
import express from "express";
import helmet from "helmet";
import routes from "./routes";

const PORT = process.env.PORT || 3000;

const app = express();

const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(",").map((o) => o.trim())
  : ["*"];

app
  .use(helmet())
  .use(
    cors({
      origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes("*") || allowedOrigins.includes(origin)) {
          return callback(null, true);
        }
        return callback(null, false);
      },
      credentials: true,
    })
  )
  .use(cookieParser())
  .use(express.urlencoded({ extended: false }))
  .use(compression())
  .use(express.json())

  .use("/api", routes)
  .use(globalErrorHandler);

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server running on ${PORT}`);
  });
}

export default app;
