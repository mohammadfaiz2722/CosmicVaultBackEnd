require('dotenv').config();
const connectToMongo = require('./db');
const cors = require('cors');
const express = require('express');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const app = express();
const port = process.env.PORT || 5000;

// Connect to MongoDB database
connectToMongo();

// Middleware
app.use(express.json()); // Parse JSON request bodies
app.use(helmet()); // Secure HTTP headers

// CORS configuration
const corsOptions = {
  origin: "http://localhost:3000" ,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};
app.use(cors(corsOptions)); // Enable CORS

// Serve static files (e.g., images in the 'uploads' folder)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // Limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Router
app.use('/api/auth', require('./routes/auth'));
app.use('/api/photos', require('./routes/photos'));

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something went wrong!');
});

// 404 Error Handler
app.use((req, res, next) => {
  res.status(404).send("Sorry, that route doesn't exist.");
});

// Start the server
app.listen(port, () => {
  console.log(`Backend server is running at http://localhost:${port}`);
  console.log(`CORS enabled for origin: ${'http://localhost:3000'}`);
});
