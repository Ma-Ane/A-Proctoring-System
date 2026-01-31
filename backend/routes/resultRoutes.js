const express = require("express");
const router = express.Router();

const Result = require('../models/result');
const User = require('../models/user');
const Exam = require('../models/exam');
const Question = require('../models/question');

// to save the results into db
router.post('/save_results', async (req, res) => {
    try {
        const { examId, userId, answers } = req.body;

        // check if the user exist or not
        const user = await User.findById(userId);
 
        if (!user) return res.status(404).json({message: "User not found."});

        const exam = await Exam.findById(examId);
 
        if (!exam) return res.status(404).json({message: "Exam not found."});

        const newResult = new Result({ examId, userId, answers });

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
        const question = await Question.findOne({ examId: examId});

        if (!question) return 0;
        
        // actual question and answer
        const questions = question.questions;

        for (let i=0; i<questions.length; i++) {
            // check if the questions are the same
            if (questions[i].title !== answers[i].title) console.log("Error for question: ", i+1);

            if (questions[i].correctAnswer === answers[i].answer) score ++;
        }

        return score/questions.length;
    } catch (error) {
        console.log(error);
    }
};

// to calculate the scores of all result
router.post('/calculate_score', async (req, res) => {
    try {
        // get all the results object from db
        const results = await Result.find();

        if (results.length === 0) {
            return res.status(200).json({ message: "No results found." });
        }
        
        for (const result of results) {
            const score = await getCorrectAnswers(result.examId, result.answers);

            // update the document with the score field
            result.score = score;
            await result.save();
        }

        res.status(200).json({message: "Score added."});
    } catch (error) {
        res.status(500).json({error: error.message});
    }
});

module.exports = router;