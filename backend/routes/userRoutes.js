const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();

const User = require('../models/user');


router.post('/login', async (req, res) => {
    try {
        // destructure the data from the req body
        const { name, batch, age, gender, role, email, password } = req.body;

        // create new instance of the user model and save it
        const newUser = User({name, batch, age, gender, role, email, password});
        await newUser.save();

        // return success message
        res.status(201).json({message: "User created successfully."});
    } catch (error) {
        res.status(500).json({error: error.message});
    }
});


module.exports = router;