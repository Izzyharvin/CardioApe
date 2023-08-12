const express = require('express')
const dotenv = require('dotenv')
const morgan = require('morgan')
const connectDB = require('./config/db')

//Load config
dotenv.config({ path: './config/config.env' })

connectDB()

const app = express();

//Logging
if(process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'))
}

//For the HTML
const path = require('path')

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// Serve homepage.html when someone accesses the root URL
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'homepage.html'));
});

//Setting up Port 3000
const PORT = process.env.PORT || 3000

// Start the server on port 3000
app.listen(
  PORT,
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
)
