const mongoose = require("mongoose");

const AnswerSchema = new mongoose.Schema({
  title: {type: String, required: true},
  answer: {type: String, required: true}
});

const resultSchema = new mongoose.Schema({
    examId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'exam'
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,        
        ref: 'user'
    },
    answers: [AnswerSchema],
    submittedAt: {type: Date, default: Date.now},
    score: {type: Number, default: -10},
    title: String,
});


module.exports = mongoose.model("result", resultSchema);