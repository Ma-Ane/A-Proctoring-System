const mongoose = require('mongoose');

const flagSchema = new mongoose.Schema({
  examId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'exam' },
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'user' },

  timestamp: { type: Number, required: true },

  violation: { type: String, required: true },

  type: {
    type: String,
    enum: ['image', 'audio', 'tab'],
    required: true
  },

  media: {
    data: { type: String },      // base64
    mime: { type: String }       // image/jpeg or audio/wav
  }

}, { timestamps: true });

module.exports = mongoose.model('flag', flagSchema);