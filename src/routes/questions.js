import { Router } from "express";
import prisma from "../lib/prisma.js";
import isOwner from "../middleware/isOwner.js";
import authenticate from "../middleware/auth.js";

import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = Router();

const storage = multer.diskStorage({
  destination: path.join(__dirname, "..", "..", "public", "uploads"),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Only image files are allowed"));
  },
  limits: { fileSize: 5 * 1024 * 1024 },
});

// All routes in this router require authentication
router.use(authenticate);



function formatQuestion(question) {
  return {
    ...question,
    date: question.createdAt.toISOString().split("T")[0],
    userName: question.user?.name || null,
    solved: question.attempts?.some((attempt) => attempt.correct) ?? false,
    user: undefined,
    attempts: undefined,
  };
}

function parseKeywords(keywords) {
  if (Array.isArray(keywords)) return keywords;
  if (typeof keywords === "string") {
    return keywords.split(",").map((k) => k.trim()).filter(Boolean);
  }
  return [];
}

router.use((err, req, res, next) => {
    if (err instanceof multer.MulterError ||
        err?.message === "Only image files are allowed") {
        return res.status(400).json({ msg: err.message });
    }
    next(err);
});
// GET /api/questions, /api/questions?keyword=historia&page=2&limit=5
router.get("/", async (req, res) => {
  const { keyword } = req.query;

  const where = keyword ? { keywords: { some: { name: keyword } } } : {};

  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.max(1, Math.min(100, parseInt(req.query.limit) || 5));
  const skip = (page - 1) * limit;

  const [filteredQuestions, total] = await Promise.all([
    prisma.question.findMany({
      where,
      include: {
        keywords: true,
        user: true,
        attempts: {
          where: { userId: req.user.userId, correct: true },
          select: { id: true, correct: true },
        },
      },
      orderBy: { id: "asc" },
      skip,
      take: limit,
    }),
    prisma.question.count({ where }),
  ]);

  res.json({
    questions: filteredQuestions.map(formatQuestion),
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  });
});

// GET /api/questions/:qid
router.get("/:qid", async (req, res) => {
  const qid = Number(req.params.qid);

  const question = await prisma.question.findUnique({
    where: { id: qid },
    include: {
      keywords: true,
      user: true,
      attempts: {
        where: { userId: req.user.userId, correct: true },
        select: { id: true, correct: true },
      },
    },
  });
  if (!question) {
    return res.status(404).json({ message: "Question not found" });
  }
  res.json(formatQuestion(question));
});

// POST /api/questions/:qid/play
router.post("/:qid/play", async (req, res) => {
  const qid = Number(req.params.qid);
  const { submittedAnswer } = req.body;
  if (!submittedAnswer) {
    return res.status(400).json({ message: "answer is required" });
  }

  const question = await prisma.question.findUnique({
    where: { id: qid },
  });

  if (!question) {
    return res.status(404).json({ message: "Question not found" });
  }

  const trimmedAnswer = submittedAnswer.trim();
  const correctAnswer = question.answer.trim();
  const correct = trimmedAnswer.toLowerCase() === correctAnswer.toLowerCase();

  const attempt = await prisma.attempt.create({
    data: {
      questionId: qid,
      userId: req.user.userId,
      submittedAnswer: trimmedAnswer,
      correct,
    },
  });

  res.json({
    id: attempt.id,
    correct: attempt.correct,
    submittedAnswer: attempt.submittedAnswer,
    correctAnswer,
    solved: attempt.correct,
    createdAt: attempt.createdAt.toISOString().replace("T", " ").slice(0, 16),
  });
});

// POST /api/questions
router.post("/", upload.single("image"), async (req, res) => {
  const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

  const { question, answer, keywords } = req.body;

  if (!question || !answer) {
    return res
      .status(400)
      .json({ message: "question and answer are required" });
  }
  const parsedKeywords = parseKeywords(keywords);
  const newQuestion = await prisma.question.create({
    data: {
      question,
      answer,
      imageUrl,
      keywords: { connectOrCreate: parsedKeywords.map((kw) => ({ where: { name: kw }, create: { name: kw } })) },
      userId: req.user.userId,
    },
    include: { keywords: true, user: true },
  });
  res.status(201).json(formatQuestion(newQuestion));
});

// PUT /api/questions/:qid
router.put("/:qid", upload.single("image"), isOwner, async (req, res) => {
  const qid = Number(req.params.qid);
  const { question, answer, keywords } = req.body;
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

  const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

  const parsedKeywords = parseKeywords(keywords);
  const updatedQuestion = await prisma.question.update({
    where: { id: qid },
    include: { keywords: true, user: true },
    data: {
      question,
      answer,
      imageUrl,
      keywords: {set:[], connectOrCreate: parsedKeywords.map((kw) => ({ where: { name: kw }, create: { name: kw }})) },
    },
  });

  res.json(formatQuestion(updatedQuestion));
});

// DELETE /api/questions/:qid
router.delete("/:qid", isOwner, async (req, res) => {
  const qid = Number(req.params.qid);
  const question = await prisma.question.findUnique({
    where: { id: qid },
    include: { keywords: true, user: true },
  });
  if (!question) {
    return res.status(404).json({ message: "Question not found" });
  }

  const deletedQuestion = await prisma.question.delete({
    where: { id: qid },
  });
  res.json({
    message: "Question deleted successfully",
    question: formatQuestion(deletedQuestion),
  });
});

export default router;
