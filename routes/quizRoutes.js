import express from "express";
import { submitQuiz } from "../controllers/quizController.js";
import authMiddleware from "../Middlewares/authMiddleware.js";


const router = express.Router();

// Submit quiz score
router.post("/submit",authMiddleware, submitQuiz);

export default router;
