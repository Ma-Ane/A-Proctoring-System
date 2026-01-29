const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
    title: {type: String, required: true},
    options: [String],
    correctAnswer: String,

});

module.exports = mongoose.model("question", questionSchema);