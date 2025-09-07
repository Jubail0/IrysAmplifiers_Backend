import User from "../models/User.js";

// Get Top Leaderboard
export const getLeaderboard = async (req, res) => {
  try {
 const maintenanceMode = true;
  
  if (maintenanceMode) {
    // Stop request here, send response
    return res.status(503).json({ message: "🚧 Quiz is under maintenance" });
  }
    const users = await User.find()
      .sort({ score: -1, streak: -1 })
      .limit(20);

    res.json(users);
  } catch (err) {
    res.status(500).json({ error: "Leaderboard fetch failed" });
  }
};

// Get User Rank
export const getUserRank = async (req, res) => {
  try {
    const { username } = req.user;
    const allUsers = await User.find().sort({ score: -1, streak: -1 });

    const rank =
      allUsers.findIndex((u) => u.username === username) + 1 || null;

    res.json({ rank, total: allUsers.length });
  } catch (err) {
    res.status(500).json({ error: "User rank fetch failed" });
  }
};

