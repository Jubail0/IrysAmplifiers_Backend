import express from "express";
import authMiddleware from "../Middlewares/authMiddleware.js";
import { getLeaderboard, getUserRank } from "../controllers/leaderboardController.js";
const router = express.Router();


router.get("/ranks", getLeaderboard);
router.get("/me", authMiddleware, getUserRank);

export default router;