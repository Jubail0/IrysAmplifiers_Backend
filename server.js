import dotenv from "dotenv";
dotenv.config();
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import irysRoutes from "./routes/irysRoutes.js";
import cookieParser from "cookie-parser";

const app = express();
const PORT = 5000;

app.use(cors({
  origin: process.env.FRONT_END_URL,
  credentials: true
}));

app.use(bodyParser.json());
app.use(cookieParser());

app.use("/auth", authRoutes);
app.use("/api", irysRoutes);


app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
