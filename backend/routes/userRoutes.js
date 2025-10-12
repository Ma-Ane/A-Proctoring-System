const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();

const User = require('../models/user');


router.post('/register', async (req, res) => {
    try {
        // destructure the data from the req body
        const { name, batch, age, gender, role, image, email, password } = req.body;

        // create new instance of the user model and save it
        const newUser = User({name, batch, age, gender, role, image, email, password});
        await newUser.save();

        // return success message
        res.status(201).json({message: "User created successfully."});
    } catch (error) {
        res.status(500).json({error: error.message});
    }
});


// get the exams of particular user from db
router.get('/get_exam/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // to find only one user, use findOne
        const foundUser = await User.findOne({_id: id});
        if (!foundUser) throw new Error ("User not found");

        // only send the exam details to the frontend
        res.status(200).json(foundUser.exams);
    } catch (error) {
        res.status(500).json({error: error.message});
    }
});




module.exports = router;