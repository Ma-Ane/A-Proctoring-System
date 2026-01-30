const mongoose = require("mongoose");

const singleQuestionSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    options: [String],
    correctAnswer: String
  },
  { _id: false }
);

const questionSchema = new mongoose.Schema({
  examId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "exam",
    required: true
  },

  questions: {
    type: [singleQuestionSchema],
    required: true
  }
});

module.exports = mongoose.model("question", questionSchema);
