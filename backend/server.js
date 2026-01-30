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
  app.use("/api/uploads", uploadRoutes);
  app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


  // fetch user image for verificaiton
  const imageRoutes = require('./routes/gerUserImageRoutes');
  app.use('/getUserImage', imageRoutes);

  // questions route
  const questionRoutes = require('./routes/questionRoutes')
  app.use('/question', questionRoutes);


// Test route
app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));