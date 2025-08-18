// controllers/quizController.js
import User from "../models/User.js";
import Question from "../models/Question.js";

// Helper: today's UTC midnight
function getUTCMidnight(date = new Date()) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

/**
 * 🔹 Get quiz status
 */
export const getQuizStatus = async (req, res) => {
  try {
    const { username } = req.user;
    if (!username) return res.status(400).json({ error: "Username missing" });

    const user = await User.findOne({ username });
    const nowUTC = new Date();
    const todayMidnight = getUTCMidnight(nowUTC);

    let locked = false;
    let nextBatchAvailable = new Date(todayMidnight);
    nextBatchAvailable.setUTCDate(nextBatchAvailable.getUTCDate() + 1);

    if (user?.lastPlayed) {
      const lastPlayedMidnight = getUTCMidnight(new Date(user.lastPlayed));
      if (lastPlayedMidnight.getTime() === todayMidnight.getTime()) {
        locked = true;
      }
    }

    res.json({ locked, nextBatchAvailable });
  } catch (err) {
    res.status(500).json({ message: "Error fetching quiz status", error: err.message });
  }
};

/**
 * 🔹 Get today's quiz questions
 */
export const getTodayQuestions = async (req, res) => {
  try {
    const { username } = req.user;
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

    const nowUTC = new Date();
    const todayMidnight = getUTCMidnight(nowUTC);

    // 🚫 If already played today → locked
    if (user.lastPlayed) {
      const lastPlayedMidnight = getUTCMidnight(new Date(user.lastPlayed));
      if (lastPlayedMidnight.getTime() === todayMidnight.getTime()) {
        const nextBatchAvailable = new Date(todayMidnight);
        nextBatchAvailable.setUTCDate(nextBatchAvailable.getUTCDate() + 1);

        return res.json({
          locked: true,
          message: "Quiz locked until next 00:00 UTC.",
          nextBatchAvailable,
        });
      }
    }

    // ✅ Do NOT set lastPlayed here. That happens in submitQuiz.
    const batch = user.todayBatch + 1;

    const questions = await Question.find()
      .sort({ date: 1 })
      .skip((batch - 1) * 5)
      .limit(5);

    if (questions.length === 0) {
      return res.status(404).json({ message: "No more questions available." });
    }

    const nextBatchAvailable = new Date(todayMidnight);
    nextBatchAvailable.setUTCDate(nextBatchAvailable.getUTCDate() + 1);

    res.json({ locked: false, questions, nextBatchAvailable });
  } catch (err) {
    res.status(500).json({ message: "Error fetching questions", error: err.message });
  }
};

/**
 * 🔹 Admin: add new question
 */
export const addQuestion = async (req, res) => {
  try {
    const data = req.body; // could be a single object or an array

    if (Array.isArray(data)) {
      // Bulk insert
      const newQuestions = await Question.insertMany(data);
      res.json({
        message: `${newQuestions.length} questions added successfully`,
        questions: newQuestions,
      });
    } else {
      // Single insert
      const { question, options, answer } = data;
      const newQuestion = new Question({ question, options, answer });
      await newQuestion.save();
      res.json({
        message: "Question added successfully",
        question: newQuestion,
      });
    }
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error adding question(s)", error: err.message });
  }
};

