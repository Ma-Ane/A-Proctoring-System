const express = require("express");
const router = express.Router();

const Result = require('../models/result');
const User = require('../models/user');
const Exam = require('../models/exam');
const Question = require('../models/question');

// to save the results into db
router.post('/save_results', async (req, res) => {
    try {
        const { examId, userId, answers, title } = req.body;

        // check if the user exist or not
        const user = await User.findById(userId);
 
        if (!user) return res.status(404).json({message: "User not found."});

        const exam = await Exam.findById(examId);
 
        if (!exam) return res.status(404).json({message: "Exam not found."});

        const newResult = new Result({ examId, userId, answers, title });

        await newResult.save();

        res.status(200).json({message: "Result saved successfully"});
    } catch (error) {
        res.status(500).json({error: error.message});
    }
});


// function to get the correct answers for each question
const getCorrectAnswers = async (examId, answers) => {
    try {
        let score = 0;
        const questionDoc = await Question.findOne({ examId: examId });
        if (!questionDoc || !questionDoc.questions.length) return 0;

        const questions = questionDoc.questions;

        for (let i = 0; i < questions.length; i++) {
            if (!answers[i]) {
                console.warn(`Missing answer for question ${i+1}`);
                continue;
            }

            if (questions[i].title !== answers[i].title)
                console.warn("Question title mismatch at index", i);

            if (questions[i].correctAnswer === answers[i].answer) score++;
        }

        return questions.length ? score / questions.length : 0;
    } catch (error) {
        console.error(error);
        return 0; // fallback if error occurs
    }
};

// to calculate the scores of all result
router.post('/calculate_score', async (req, res) => {
    try {
        const results = await Result.find({ score: -10 });

        if (!results.length) {
            return res.status(200).json({ message: "No ungraded results found." });
        }

        await Promise.all(results.map(async (result) => {
            try {
                const score = await getCorrectAnswers(result.examId, result.answers);
                const finalScore = (typeof score === "number" && !isNaN(score)) ? score : 0;

                await Result.updateOne(
                    { _id: result._id },
                    { $set: { score: finalScore } }
                );

            } catch (err) {
                console.error(`Error grading result ${result._id}:`, err.message);
            }
        }));

        res.status(200).json({ message: "Scores calculated and updated." });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});


module.exports = router;