import mongoose from "mongoose"; 

const questionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: [{ type: String, required: true }],
  answer: { type: String, required: true },
  date: { type: Date, default: Date.now },
  day: { type: Number } // optional: which quiz day this belongs to
});

 export default mongoose.model("Question", questionSchema);