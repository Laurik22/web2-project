import { Router } from 'express';
import quizData from '../data/questions.js';

const router = Router();

//GET all /api/questions
router.get("/", (req, res) => {
res.json(quizData)
});

//GET /api/questions/:qId
router.get("/:qid", (req, res) => {

const qid = Number(req.params.qid);
const question = quizData.find((q) => q.id === qid);

if(!question){
    res.status(404).json({msg: "Question not found"})
}
res.json(question)
});

//POST 
router.post("/", (req, res) => {
const {question, answer} = req.body;

  if (!question || !answer) {
    return res.status(400).json({
      message: "question and answer are required"
    });
  }
  const maxId = Math.max(...quizData.map(q => q.id), 0);

  const newQuestion = {
    id: quizData.length ? maxId + 1 : 1,
    question, answer
  };
  quizData.push(newQuestion);
  res.status(201).json(newQuestion);
});

//PUT 
router.put("/:qId", (req, res) => {
const qId = Number(req.params.qId);
  const { question, answer } = req.body;

  const q = quizData.find((p) => p.id === qId);

  if (!q) {
    return res.status(404).json({ message: "Question not found" });
  }

  if (!question | !answer) {
    return res.json({
      message: "question and answer are required"
    });
  }
  q.question = question;
  q.answer = answer;
  res.json(q);
});

//DELETE
router.delete("/:qId", (req, res) => {
 const qId = Number(req.params.qId);

  const questionIndex = quizData.findIndex((p) => p.id === qId);

  if (questionIndex === -1) {
    return res.status(404).json({ message: "Post not found" });
  }

  const deletedQuestion = quizData.splice(questionIndex, 1);

  res.json({
    message: "Questiont deleted successfully",
    question: deletedQuestion[0]
  });
});


export default router;