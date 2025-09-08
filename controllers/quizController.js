// controllers/submitQuiz.js
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Question from "../models/Question.js";

function getUTCMidnight(date = new Date()) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

export const submitQuiz = async (req, res) => {
  try {
 const maintenanceMode = false;
  
  if (maintenanceMode) {
    // Stop request here, send response
    return res.status(503).json({ message: "🚧 Quiz is under maintenance" });
  }
    const { answers } = req.body;
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "Not logged in" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const username = decoded.username;
    if (!username) return res.status(400).json({ error: "Username missing" });

    let user = await User.findOne({ username });
    if (!user) {
      user = new User({
        username,
        score: 0,
        streak: 0,
        believer: false,
        lastPlayed: null,
        answeredQuestions: [],
        todayBatch: 0,
      });
      await user.save();
    }

    const now = new Date();
    const todayUTC = getUTCMidnight(now);

    // 🚫 Already submitted today?
    if (user.lastPlayed) {
      const lastPlayedMidnight = getUTCMidnight(new Date(user.lastPlayed));
      if (lastPlayedMidnight.getTime() === todayUTC.getTime()) {
        const nextQuizAvailable = new Date(todayUTC);
        nextQuizAvailable.setUTCDate(nextQuizAvailable.getUTCDate() + 1);
        return res.status(400).json({
          message: "Already submitted today. Come back tomorrow.",
          locked: true,
          nextQuizAvailable,
        });
      }
    }

    // Fetch questions & grade
    const questionIds = answers.map((a) => a.questionId);
    const questions = await Question.find({ _id: { $in: questionIds } });

    let score = 0;
    answers.forEach((a) => {
      const q = questions.find((q) => q._id.toString() === a.questionId);
      if (q && q.answer === a.selectedOption) score += 10;
    });

    // Update streak
    let newStreak = 1;
    if (user.lastPlayed) {
      const yesterdayUTC = new Date(todayUTC);
      yesterdayUTC.setUTCDate(todayUTC.getUTCDate() - 1);
      const lastPlayedDate = getUTCMidnight(new Date(user.lastPlayed));
      if (lastPlayedDate.getTime() === yesterdayUTC.getTime()) {
        newStreak = user.streak + 1;
      }
    }

    // ✅ Update user only here
    user.score += score;
    user.streak = newStreak;
    user.lastPlayed = now;
    user.todayBatch += 1;
    user.believer = score >= 30;
    user.answeredQuestions.push(...questionIds);
    await user.save();

    const nextQuizAvailable = new Date(todayUTC);
    nextQuizAvailable.setUTCDate(todayUTC.getUTCDate() + 1);

    res.json({
      message: "Score submitted successfully",
      score,
      locked: true, // locked after submission
      nextQuizAvailable,
      user: {
        username: user.username,
        score: user.score,
        streak: user.streak,
        believer: user.believer,
      },
    });
  } catch (err) {
    console.error("Quiz submission error:", err);
    res.status(500).json({ error: "Quiz submission failed" });
  }
};


