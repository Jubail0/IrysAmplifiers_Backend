import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  score: { type: Number, default: 0 },
  streak: { type: Number, default: 0 },
  believer: { type: Boolean, default: false },
  todayBatch: { type: Number, default: 0 }, 
  lastPlayed: { type: Date },  // keep only one
  answeredQuestions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Question" }] // optional
});

export default mongoose.model("User", userSchema);
