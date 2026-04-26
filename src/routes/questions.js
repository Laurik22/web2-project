import { Router } from "express";
import prisma from "../lib/prisma.js";
import isOwner from "../middleware/isOwner.js";
import authenticate from "../middleware/auth.js";
const router = Router();

// All routes in this router require authentication
router.use(authenticate);

// GET /api/questions
router.get("/", async (req, res) => {
  try {
    const questions = await prisma.question.findMany();
    res.json(questions);
  } 
  catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch questions" });
  }
});

// GET /api/questions/:qid
router.get("/:qid", async (req, res) => {
  const qid = Number(req.params.qid);

  const question = await prisma.question.findUnique({
    where: { id: qid },
  });

  if (!question) {
    return res.status(404).json({ message: "Question not found" });
  }
  res.json(question);
});

// POST /api/questions
router.post("/", async (req, res) => {
  const { question, answer } = req.body;

  if (!question || !answer) {
    return res
      .status(400)
      .json({ message: "question and answer are required" });
  }
  const newQuestion = await prisma.question.create({
    data: { question, answer, userId: req.user.id },
  });
  res.status(201).json(newQuestion);
});

// PUT /api/questions/:qid
router.put("/:qid", isOwner, async (req, res) => {
  const qid = Number(req.params.qid);
  const { question, answer } = req.body;
  const existingQuestion = await prisma.question.findUnique({
    where: { id: qid },
  });
  if (!existingQuestion) {
    return res.status(404).json({ message: "Question not found" });
  }

  if (!question || !answer) {
    return res
      .status(400)
      .json({ message: "question and answer are required" });
  }
  const updatedQuestion = await prisma.question.update({
    where: { id: qid },
    data: { question, answer },
  });
  res.json(updatedQuestion);
});

// DELETE /api/questions/:qid
router.delete("/:qid", isOwner, async (req, res) => {
  const qid = Number(req.params.qid);
  const question = await prisma.question.findUnique({
    where: { id: qId },
  });
  if (!question) {
    return res.status(404).json({ message: "Question not found" });
  }

  const deletedQuestion = await prisma.question.delete({
    where: { id: qid },
  });
  res.json({
    message: "Question deleted successfully",
    question: deletedQuestion,
  });
});

export default router;
