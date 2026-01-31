const express = require("express");
const router = express.Router();

const Result = require('../models/result');
const User = require('../models/user');
const Exam = require('../models/exam');

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


module.exports = router;