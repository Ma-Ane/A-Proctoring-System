const express = require('express');
const cors = require('cors');
require("dotenv").config();
const connectDB = require('./config_db');
const path = require('path');
const cookieParser = require("cookie-parser");
const helmet = require("helmet");


connectDB(  );

const app = express();
const PORT = process.env.PORT || 5000;

// security middleware
app.use(helmet());

// Middlewares
// if using cookies, then we need to mention the origin
app.use(cors({
    origin: "http://localhost:5173", // your frontend URL
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());


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

  // results route
  const resultRoutes = require('./routes/resultRoutes');
  app.use('/result', resultRoutes);

  // flags route
  const flagRoutes = require('./routes/flagRoutes');
  app.use('/flag', flagRoutes);


// Test route
app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));