const express = require('express');
const mongoose = require('mongoose');
const app = express();
const router = express.Router();
const path = require('path');
const bcrypt = require('bcrypt');
const session = require('express-session');
require('dotenv').config();


app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
}));

// Define the UserData model
const userTag = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
});

const UserData = mongoose.model('UserData', userTag);

// API Middleware
app.use(express.json()); //This is to accept data in json format
app.use(express.urlencoded()); //This is basically to decod the data send through html form

// Serve static files from a directory (e.g., 'public')
app.use(express.static('public'));

// MongoDB Cluster URI
const uri = "mongodb+srv://dustinharp:CardioApe2023@cluster1.85j138f.mongodb.net/?retryWrites=true&w=majority";

// Fails or Connects to MongoDB
async function connect() {
    try {
        await mongoose.connect(uri);
        console.log("Connected to MongoDB");
    } catch (error) {
        console.error(error);
    }
}

// Calls connect function
connect();

// MongoDB Schema to store user data
const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true }, // Change 'uniques' to 'unique'
    password: { type: String, required: true },
    // Add other fields like name, profile picture, etc.
});

const User = mongoose.model('User', userSchema);

// Register Route that will store data of user signup
router.post('/signup', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = new User({ email, password });
        await user.save();
        res.status(201).send('User registered successfully');
    } catch (error) {
        res.status(400).send('Error during user registration');
        console.error(error); // Log the error
        res.status(500).send('Internal server error'); // Send a generic error message
    }
});

// Use the router middleware
app.use(router);

// Serve homepage.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'homepage.html'));
});

// Handle user registration
app.post('/signup', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Check if required fields are provided
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Name, email, and password are required' });
        }

        // Check if the user already exists
        const existingUser = await UserData.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash the user's password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new user
        const newUser = new UserData({ name, email, password: hashedPassword });
        await newUser.save();

        // Redirect to the profile page after successful registration
        // After successful login or signup
        res.redirect('/profile');

        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

  

app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
  
        // Check if the user exists
        const user = await UserData.findOne({ email });
    
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }
    
        // Compare the provided password with the hashed password in the database
        const passwordMatch = await bcrypt.compare(password, user.password);
    
        if (!passwordMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }
    
        // Set up user session or generate a JWT token for authentication
        // Example using express-session:
        req.session.user = user; // Store user data in the session
        res.status(200).json({ message: 'Login successful' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Profile route - protected route (requires authentication)
app.get('/profile', isAuthenticated, (req, res) => {
    // Get user information from the session (or your database) and pass it to the profile page
    const user = req.session.user;
    res.sendFile(path.join(__dirname, 'public', 'profile.html'));
});


// Middleware to check if the user is authenticated
function isAuthenticated(req, res, next) {
    if (req.session && req.session.user) {
        // User is authenticated, proceed to the next middleware/route handler
        return next();
    }
    // User is not authenticated, redirect to the login page or handle it as needed
    res.redirect('/login');
}

// Profile route - protected route (requires authentication)
app.get('/profile', isAuthenticated, (req, res) => {
    // Get user information from the session (or your database) and pass it to the profile page
    const user = req.session.user;
    res.sendFile(path.join(__dirname, 'public', 'profile.html')); // Send the profile.html file
});



// Listen to the Port that the server runs on
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});
