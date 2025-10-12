const express = require('express');
const cors = require('cors');
require("dotenv").config();
const connectDB = require('./config_db');
const path = require('path');

// 6cBfnFt5MtZSRnQc
// maharjanmanjit46_db_user

connectDB(  );

const app = express();
const PORT = process.env.PORT || 5000;


// Middlewares
app.use(cors());
app.use(express.json());


// created test routes
  // user routes
  const userRoutes = require('./routes/userRoutes');
  app.use('/api/auth', userRoutes);

  // exam routes
  const examRoutes = require('./routes/examRoutes');
  app.use('/api/exam', examRoutes); 

  // upload image routes
  const uploadRoutes = require('./routes/uploadImageRoutes');
  app.use("/api/upload", uploadRoutes);
  app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


// Test route
app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));