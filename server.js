const express = require('express');
const mongoose = require('mongoose');
const app = express();
const router = express.Router();
const path = require('path');
const UserData = require('./models/user'); // Import your UserData model
const bcrypt = require('bcrypt');


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
  
        // Check if the user already exists
        const existingUser = await UserData.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }
  
        // Hash the user's password
        const hashedPassword = await bcrypt.hash(password, 10); // The number is the salt rounds (10 is a good starting point)
        
        // Create a new user
        const newUser = new UserData({ name, email, password });
        await newUser.save();
      
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
  
  

// Listen to the Port that the server runs on
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});
