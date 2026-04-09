import express from 'express';
import router from './routes/questions.js';

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
// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
