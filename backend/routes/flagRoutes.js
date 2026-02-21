const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();
const { ObjectId } = require('mongodb');

const Flag = require('../models/flag');

// get the flags of the user for the specified exam 
router.get('/get_student_violations/:examId/:userId', async (req, res) => {
  try {
    const { examId, userId } = req.params;

    // Validate IDs
    if (!mongoose.Types.ObjectId.isValid(examId) || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: "Invalid examId or userId" });
    }

    // Find all flags for this exam and student
    const violations = await Flag.find({
      examId: examId,
      userId: userId
    });

    res.status(200).json({ violations });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;