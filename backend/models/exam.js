const mongoose = require('mongoose');

const examSchema = new mongoose.Schema({
    title: String,
    subject: String,
    type: String,
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'user'
    },
    time: String,
    date: {type: Date, default: Date.now},
    isActive: {type: Boolean, default: true},
    batch: String,
});


module.exports = mongoose.model('exam', examSchema);    