const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: String,
    batch: String,
    gender: String,
    age: Number,
    exams: [
        {
            exam_id: String,
            score: Number,
            subject: String,
            date: Date
        }
    ],
    email: String,
    password: String,
    role: String
});


module.exports = mongoose.model('user', userSchema);