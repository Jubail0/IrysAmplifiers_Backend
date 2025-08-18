import express from "express";
import { getTodayQuestions, addQuestion, getQuizStatus } from "../controllers/questionController.js";
import authMiddleware from '../Middlewares/authMiddleware.js'

const router = express.Router();
router.get("/status", authMiddleware, getQuizStatus);
router.get("/questions", authMiddleware, getTodayQuestions);
router.post("/add", addQuestion); // (admin only)

export default router;
