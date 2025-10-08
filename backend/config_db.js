// DB configuraation and env configuration

const mongoose = require('mongoose');

const connectDB = async () => {
    try{
        await mongoose.connect(process.env.MONGO_URL);
        console.log("Connection successful");
    } catch (error) {
        console.log("Connection failed", error);
        process.exit(1);
    }
};

// for connection with the mongoDB 
module.exports = connectDB;