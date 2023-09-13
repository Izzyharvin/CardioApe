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

const userTag = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
});

const UserData = mongoose.model('UserData', userTag);

app.use(express.json());
app.use(express.urlencoded());
app.use(express.static('public'));

const uri = "mongodb+srv://dustinharp:CardioApe2023@cluster1.85j138f.mongodb.net/?retryWrites=true&w=majority";

async function connect() {
    try {
        await mongoose.connect(uri);
        console.log("Connected to MongoDB");
    } catch (error) {
        console.error(error);
    }
}

connect();

// Serve static files from the 'public' directory
app.use(express.static('public'));

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
});

const User = mongoose.model('User', userSchema);

function isAuthenticated(req, res, next) {
    if (req.session && req.session.user) {
        return next();
    }
    res.redirect('/login');
}

app.use(router);

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'homepage.html'));
});

app.post('/signup', async (req, res) => {
    try {
        console.log('Registration request received');
        const { name, email, password } = req.body;

        // Log the request body for debugging
        console.log('Request body:', req.body);

        // Check if required fields are provided
        if (!name || !email || !password) {
            res.status(400).json({ message: 'Name, email, and password are required' });
            return; // Add a return statement to exit the function
        }

        // Check if the user already exists
        const existingUser = await UserData.findOne({ email });
        if (existingUser) {
            res.status(400).json({ message: 'User already exists' });
            return; // Add a return statement to exit the function
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new UserData({ name, email, password: hashedPassword });
        await newUser.save();

        // Redirect to the profile page after successful registration
        res.redirect('/profile');
    } catch (error) {
        console.error('Error during user registration:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await UserData.findOne({ email });

        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        req.session.user = user;

        // Redirect to the profile page after successful login
        res.redirect('/profile');
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/profile', isAuthenticated, (req, res) => {
    const user = req.session.user;
    res.sendFile(path.join(__dirname, 'public', 'profile.html'));
});


const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});
