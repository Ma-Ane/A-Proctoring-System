const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();

const Exam = require('../models/exam');

router.post('/', async (req, res) => {
   try {
    const newExam = new Exam(req.body);         // get all the data from the req body
    await newExam.save();

    res.status(201).json({message: "Exam created successfully."});
   } catch (error) {
        res.status(500).json({error: error.message});
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


module.exports = router;