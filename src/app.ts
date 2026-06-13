import compression from "compression";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import helmet from "helmet";
import routes from "./routes";

dotenv.config();

const PORT = process.env.PORT || 3000;

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(compression());
app.use(express.json());

app.use("/api", routes);

app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});

export default app;
