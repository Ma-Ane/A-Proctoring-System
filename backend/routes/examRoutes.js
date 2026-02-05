const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();

const Exam = require('../models/exam');
const User = require('../models/user');

// save the exam instance in the db
router.post('/', async (req, res) => {
  try {
    const newExam = new Exam(req.body);   // create exam instance
    await newExam.save();                 // save to DB

    res.status(201).json({
      message: "Exam created successfully.",
      examId: newExam._id                 // return examId
    });

  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
});


// exam for each batch of students
router.get('/:batch', async (req, res) => {
    try {
        const { batch } = req.params;
        const data = await Exam.find({batch: batch});
        
        if (!data) throw new Error("No exams found");

        // returns a list of object 
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({error: error.message});
    }
});


// for teachers to get the exam they have created
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const foundUser = await User.findById(userId);
    if (!foundUser) return res.status(404).json({error: "No user found."});

    const exams = await Exam.find({ createdBy: new mongoose.Types.ObjectId(userId) });
    if (exams.length === 0) return res.status(404).json({error: "No exam has been created."});

    res.status(200).json(exams);
  } catch (error) {
    res.status(500).json({error: error.message});
  }
});


module.exports = router;