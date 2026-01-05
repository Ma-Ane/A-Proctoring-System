//const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();
// for hasing the password
const bcrypt = require('bcrypt');
const path = require('path');
const fs = require('fs');

const User = require('../models/user');


// a function to take plain text and hash 
async function hashPassword (password) {
    const SALT = 10;         // higher means more secure, but slower
    const hashedPassword = await bcrypt.hash(password, SALT);
    return hashedPassword;
}

// a function to validate the hashed password
async function verifyPassword (plainPassword, hashedPassword) {
    const isMatch = await bcrypt.compare(plainPassword, hashedPassword);
    return isMatch;             // returns true is the password is verified
}


// to sgnup the user an save it in the db
router.post('/register', async (req, res) => {
    try {
        // destructure the data from the req body
        const { name, batch, age, gender, role, image, email, password } = req.body;

        // hash the password before saving it into the db
        const hashedPassword = await hashPassword(password);

        // Resolve the image file path based on the filename string
        const imagePath = path.join(__dirname, '..', 'uploads', image);  // Adjust to your actual image storage path

        // Check if the image exists before proceeding
        if (!fs.existsSync(imagePath)) {
            return res.status(400).json({ error: 'Image file not found' });
        }

        // Read the image file as a Buffer
        const imageBuffer = fs.readFileSync(imagePath);

        // Sending image to FastAPI to get face embedding

        const formData = new FormData();
        const blob = new Blob([imageBuffer]);

        formData.append('hd_image', blob, image);

        const response = await fetch('http://127.0.0.1:8000/register-user', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error('FastAPI request failed');
        }

        const data = await response.json();
        const embedding = data.embedding;

        const newUser = await User({name, batch, age, gender, role, image, embedding, email, password: hashedPassword});
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

// get embedding of current user from db
router.get('/get_embedding/:email', async (req, res) => {
    try {
        const { email } = req.params;

        // to find only one user, use findOne
        const foundUser = await User.findOne({ email });
        if (!foundUser) throw new Error ("User not found");

        // only send the exam details to the frontend
        res.status(200).json(foundUser.embedding);
    } catch (error) {
        res.status(500).json({error: error.message});
    }
});

// check the login info to grant access
router.post('/verify_credentials', async(req, res) => {
    try {
        const {email, password} = req.body;

        // find that one user from the db with email
        const foundUser = await User.findOne({email: email});
        if (!foundUser) throw new Error("User with such email not found");

        // verify the password of the user
        const isMatch = await verifyPassword(password, foundUser.password);
        if (isMatch)
            res.status(200).json({message: "User found"});
        else
            res.status(401).json({error: "Incorrect Password"});

    } catch (error) {
        res.status(500).json({error: error.message});
    }
});

module.exports = router;