const mongoose = require('mongoose');

const flagSchema = new mongoose.Schema({
  examId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'exam' },
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'user' },
  timestamp: { type: Number, required: true },
  violation: { type: String, required: true },
  screenshot: { type: String } // optional base64
});

module.exports = mongoose.model('flag', flagSchema);