const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();

const User = require('../models/user');

router.get('/:userName', async (req, res) => {
    try {
        const userName = req.params.userName;

        const foundUser = await User.findOne({name: userName});

        if(!foundUser) throw new Error("No user found");

        res.status(200).json({image: foundUser.image})
    } catch (error) {
        res.status(500).json({error: error.message});
    }
});

module.exports = router;