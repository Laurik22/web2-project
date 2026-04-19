import express from 'express';
import router from './routes/questions.js';
import prisma from './lib/prisma.js';

const PORT = process.env.PORT || 3000;

// Create an Express application
const app = express();
// Middleware to parse JSON bodies
app.use(express.json())

// Use the questions router for routes starting with /questions
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

