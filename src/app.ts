import compression from "compression";
import cookieParser from "cookie-parser";
import cors from "cors";
import "dotenv/config";
import express from "express";
import helmet from "helmet";
import routes from "./routes";
import { globalErrorHandler } from "@/middlewares/error.middleware";

const PORT = process.env.PORT || 3000;

const app = express();

app.use(helmet());
app.use(cors());
app.use(cookieParser()); // Mount cookie-parser to parse request cookies
app.use(express.urlencoded({ extended: false }));
app.use(compression());
app.use(express.json());

app.use("/api", routes);

// Global Error Handler (must be mounted last)
app.use(globalErrorHandler);

app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});

export default app;
