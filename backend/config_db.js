// DB configuration and env configuration

const mongoose = require("mongoose");

let isConnected = false; // Track connection state

const connectDB = async () => {
    if (isConnected) {
        console.log("🟢 MongoDB already connected");
        return;
    }

    try {
        if (!process.env.MONGO_URL) {
            throw new Error("MONGO_URL is not defined in environment variables");
        }

        console.log("🔵 Connecting to MongoDB...");

        const connection = await mongoose.connect(process.env.MONGO_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        isConnected = connection.connections[0].readyState === 1;

        console.log("✅ MongoDB connected successfully");

    } catch (error) {
        console.error("❌ Error connecting to MongoDB:", error.message);
        process.exit(1);
    }
};

// Graceful shutdown (similar to handling exceptions in FastAPI)
process.on("SIGINT", async () => {
    try {
        await mongoose.connection.close();
        console.log("🔴 MongoDB connection closed");
        process.exit(0);
    } catch (error) {
        console.error("❌ Error during MongoDB shutdown:", error.message);
        process.exit(1);
    }
});

module.exports = connectDB;