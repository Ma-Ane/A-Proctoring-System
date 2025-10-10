const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: String,
    batch: String,
    gender: String,
    age: Number,
    exams: [
        {
            exam_id: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'exam',
            },
            title: String,
            score: String,
            subject: String,
            date: Date,
            status: String,
        }
    ],
    email: String,
    password: String,
    role: String
});


module.exports = mongoose.model('user', userSchema);