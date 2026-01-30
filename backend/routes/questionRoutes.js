const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");   

const Question = require('../models/question');

// to insert the quetions into db
router.post("/add_questions", async (req, res) => {
  try {
    const { examId, questions } = req.body;

    // Basic validation
    if (!examId || !questions || !Array.isArray(questions)) {
      return res.status(400).json({
        message: "examId and questions array are required"
      });
    }

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(examId)) {
      return res.status(400).json({
        message: "Invalid examId"
      });
    }

    // Create document
    const questionDoc = await Question.create({
      examId,
      questions
    });

    res.status(201).json({
      message: "Questions added successfully",
      data: questionDoc
    });
  } catch (error) {
    console.error("Error adding questions:", error);
    res.status(500).json({
      message: "Internal server error"
    });
  }
});


// to fetch the questions of the exam
router.get("/get_exam_que/:examId", async (req, res) => {
    try {
        const { examId } = req.params;

        const foundQuestions = await Question.findOne({examId: examId});

        if (!foundQuestions) return res.status(404).json({message: "ExamId invalid"});

        // returns the list of arrays of questions
        res.status(200).json(foundQuestions.questions);
    } catch (error) {
        res.status(500).json({ message: error.message});
    }
});

module.exports = router;