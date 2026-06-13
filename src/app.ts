import "dotenv/config";
import compression from "compression";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import routes from "./routes";

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
