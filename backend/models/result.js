const mongoose = require("mongoose");

const AnswerSchema = new mongoose.Schema({
  title: {type: String, required: true},
  answer: {type: String, required: true}
});

const resultSchema = new mongoose.Schema({
    examId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,        
    },
    answers: [AnswerSchema],
    submittedAt: {type: Date, default: Date.now}
});


module.exports = mongoose.model("result", resultSchema);