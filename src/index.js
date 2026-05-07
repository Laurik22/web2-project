import express from 'express';
import router from './routes/questions.js';
import prisma from './lib/prisma.js';
import authRouter from "./routes/auth.js";
import path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3000;
// Create an Express application
const app = express();
app.use(express.static(path.join(__dirname, "..", "public")));
// Middleware to parse JSON bodies
app.use(express.json())

// Import the auth router
app.use("/api/auth", authRouter);
app.use("/api/questions", router);

app.use((req, res) => {
  res.json({msg: "Not found"});
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Internal server error" });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
// Graceful shutdown
process.on("SIGINT", async () => {
  await prisma.$disconnect();
  process.exit(0);
});
process.on("SIGTERM", async () => {
  await prisma.$disconnect();
  process.exit(0);
});

