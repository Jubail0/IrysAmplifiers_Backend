import dotenv from "dotenv";
dotenv.config();
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import irysRoutes from "./routes/irysRoutes.js";
import cookieParser from "cookie-parser";
import connectDB from "./config/db.js";
import leaderBoardRoutes from "./routes/leaderBoardRoutes.js";
import quizRoutes from "./routes/quizRoutes.js";
import questionRoutes from './routes/questionRoutes.js';

const app = express();
const PORT = 5000;

app.use(cors({
  origin: process.env.FRONT_END_URL,
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

app.use(bodyParser.json());
app.use(cookieParser());
connectDB();

app.use("/auth", authRoutes);
app.use("/api", irysRoutes);
app.use("/leaderboard", leaderBoardRoutes);
app.use("/quiz", quizRoutes);
app.use("/quiz", questionRoutes);



app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
