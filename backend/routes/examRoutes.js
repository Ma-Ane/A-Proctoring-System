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


//////////// paaxi tala ko wala API use garnee.. maathi ko ignore in frontend as well
// exam for each batch of students
router.get('/get_exam_batch/:batch', async (req, res) => {
    try {
        const { batch } = req.params;

        // find the exam in the batch that is active
        const exams = await Exam.find({ batch: batch, isActive: true });
        if (exams.length === 0) return res.status(404).json({error: "Exams not found."})

        // for each exam, fetch the creator's image
        const examsWithImage = await Promise.all(exams.map(async exam => {
            const user = await User.findById(exam.createdBy).select("image"); // only get image
            return {
                ...exam.toObject(),
                image: user ? user.image : null
            };
        }));

        // returns a list of object 
        res.status(200).json(examsWithImage);
    } catch (error) {
        res.status(500).json({error: error.message});
    }
});

// exams in batch which is not attended
router.get('/get_exam_batch/:batch/:userId', async (req, res) => {
    try {
        const { batch, userId } = req.params;

        // examIds already attempted
        const results = await Result.find({ userId: userId }).select("examId");

        const attendedExamIds = results.map(r => r.examId);

        // Fetch only exams NOT in attended list
        const exams = await Exam.find({
            batch: batch,
            isActive: true,
            _id: { $nin: attendedExamIds }
        });

        //For each exam, fetch the creator's image
        const examsWithImage = await Promise.all(exams.map(async exam => {
            const user = await User.findById(exam.createdBy).select("image"); // only get image field
            return {
                ...exam.toObject(),          // convert Mongoose doc to plain JS object
                image: user ? user.image : null // add the creator image
            };
        }));

        res.status(200).json(examsWithImage);

    } catch (error) {
        res.status(500).json({ error: error.message });
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
    if (!user) return res.status(404).json({ error: "User not found." });

    // convert userId to ObjectId
    const objectUserId = new mongoose.Types.ObjectId(userId);

    // get results for this user
    const results = await Result.find({ userId: objectUserId });
    const userExamIds = results.map(r => r.examId.toString());
    const userExamSet = new Set(userExamIds);

    // get all exams that are either inactive OR attended by the user
    const exams = await Exam.find({
      $or: [
        { isActive: false },
        { _id: { $in: userExamIds } }
      ]
    });

    const examsWithAttendance = exams.map(exam => {
      const examObj = exam.toObject();
      const examIdStr = exam._id.toString();

      // default to true
      let hasAttended = true;

      // mark false only if exam is inactive and user did not attend
      if (!exam.isActive && !userExamSet.has(examIdStr)) {
        hasAttended = false;
      }

      return {
        ...examObj,
        hasAttended
      };
    });

    res.status(200).json(examsWithAttendance);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;