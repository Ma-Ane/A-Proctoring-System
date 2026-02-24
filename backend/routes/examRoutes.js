const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();

const Exam = require('../models/exam');
const User = require('../models/user');
const Result = require('../models/result');

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

        // find the exam in the batch that is active
        const data = await Exam.find({ batch: batch, isActive: true });
        
        if (!data) throw new Error("No exams found");

        // returns a list of object 
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({error: error.message});
    }
});


// for teachers to get the exam they have created
router.get('/get_exam_teacher/:userId', async (req, res) => {
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


// to mark of make any exam active or inactive
router.patch("/toggle_active_status/:examId", async (req, res) => {
  try {
    const { examId } = req.params;

    const foundExam  = await Exam.findById(examId);

    if (!foundExam) return res.status(404).json({error: "Exam not found."});

    // toggle status
    foundExam.isActive = !foundExam.isActive;

    await foundExam.save();

    res.status(200).json({message: "Exam status updated successfully.", isActive: foundExam.isActive})
  } catch (error) {
    res.status(500).json({error: error.message});
  }
});


// for portfolio section .... to see in which exams did the user appear in 
router.get('/my_exams/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    // verify if the user exists
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({error: "User not found."});

    // check if the user has given any exam
    const results = await Result.find({ userId: userId});
    if (!results || results.length === 0) 
      return res.status(404).json({error: "Results not found."});

    // extract exam ids
    const examIds = results.map(r => r.examId);

    // get exam details
    const exams = await Exam.find({ _id: { $in: examIds }});

    res.status(200).json(exams);
  } catch (error) {
    res.status(500).json({error: error.message});
  }
});


module.exports = router;