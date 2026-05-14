import authRouter from "./routes/auth.js";
import router from "./routes/questions.js";
import express from 'express';
import path from "path";
import { fileURLToPath } from 'url';
import errorHandler from "./middleware/errorHandler.js";
import pinoHttp from "pino-http";
import logger from "./lib/logger.js";

const app = express();
app.use(pinoHttp({
  logger,
  autoLogging: { ignore: (req) => req.url.startsWith("/uploads") },
}));
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, "..", "public")));
app.use("/api/auth", authRouter);
app.use("/api/questions", router);
app.use((req, res) => {
  throw new NotFoundError();
});
app.use(errorHandler)

export default app;
