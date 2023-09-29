const express = require('express');
const mongoose = require('mongoose');
const app = express();
const router = express.Router();
const path = require('path');
const bcrypt = require('bcrypt');
const session = require('express-session');
require('dotenv').config();
const bodyParser = require('body-parser');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const MongoDBStore = require('connect-mongodb-session')(session);



const store = new MongoDBStore({
    uri: 'mongodb+srv://dustinharp:CardioApe2023@cluster1.85j138f.mongodb.net/?retryWrites=true&w=majority',
    collection: 'sessions', // The name of the collection where sessions will be stored
    // Additional options if needed
});

// Middleware for session management
app.use(
    session({
      secret: process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: true,
      store: store, // Use the MongoDB store for sessions
    })
);

// Initialize Passport.js
app.use(passport.initialize());
app.use(passport.session());

// Middleware for parsing JSON requests
app.use(bodyParser.json());

// Passport configuration
passport.use(new LocalStrategy(
    {
      usernameField: 'email', // Assuming the field name is 'email' in your login form
      passwordField: 'password', // Assuming the field name is 'password' in your login form
    },
    async (email, password, done) => {
      try {
        // Find a user in your MongoDB database by their email
        const user = await UserData.findOne({ email });

        console.log('Email:', email);
        console.log('User:', user);
  
        if (!user) {
          return done(null, false, { message: 'Incorrect email or password' });
        }
  
        const passwordMatch = await bcrypt.compare(password, user.password);
  
        if (passwordMatch) {
          return done(null, user);
        } else {
          return done(null, false, { message: 'Incorrect email or password' });
        }
      } catch (error) {
        return done(error);
      }
    }
));

passport.serializeUser((user, done) => {
    // Serialize the user to store in the session
    done(null, user.id);
  });
  
  passport.deserializeUser(async (id, done) => {
    try {
      // Deserialize the user from the session
      const user = await UserData.findById(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
});

// Middleware for user authentication
const isAuthenticated = (req, res, next) => {
    // Your authentication logic here
    if (req.isAuthenticated()) {
      console.log('Authentication successful');
      return next();
    }
    console.log('Authentication failed');
    res.status(401).json({ message: 'Unauthorized' });
};

// Middleware to set Cache Control headers
app.use((req, res, next) => {
    res.header('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    next();
});

const userTag = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    subscriptionStatus: {
        type: Boolean,
        default: false, // Set the default value to false (not subscribed)
    },
});

const UserData = mongoose.model('UserData', userTag);

app.use(express.json());
app.use(express.urlencoded());
app.use(express.static('public'));

// Serve static files from the 'public' directory
// app.use(express.static(path.join(__dirname, 'public')));

const uri = "mongodb+srv://dustinharp:CardioApe2023@cluster1.85j138f.mongodb.net/?retryWrites=true&w=majority";

mongoose.connect('mongodb+srv://dustinharp:CardioApe2023@cluster1.85j138f.mongodb.net/?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  ssl: true, // Add this line for SSL
});

async function connect() {
    try {
        await mongoose.connect(uri);
        console.log("Connected to MongoDB");
    } catch (error) {
        console.error(error);
    }
}

async function checkSubscriptionStatus(userId) {
    try {
        const user = await UserData.findById(userId);
        if (!user) {
            // Handle the case where the user is not found
            return false; // Assuming false means not subscribed
        }
        return user.subscriptionStatus; // Return the user's subscription status
    } catch (error) {
        console.error('Error checking subscription status:', error);
        return false; // Return false in case of an error
    }
}

connect();

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
});

const User = mongoose.model('User', userSchema);

app.use(router);


app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'homepage.html'));
});

app.get('/profile', isAuthenticated, async (req, res) => {
    try {
        // Check the user's subscription status in your database
        const userId = req.user.id; // Replace with your authentication logic
        const isSubscribed = await checkSubscriptionStatus(userId); // Implement this function

        // Set the Content-Type header to indicate that it's an HTML document
        res.setHeader('Content-Type', 'text/html');


        // Log whether the user is subscribed or not
        if (isSubscribed) {
            console.log('User is subscribed');
        } else {
            console.log('User is not subscribed');
        }

        // Assuming profile.html is in the 'public' folder
        res.sendFile(path.join(__dirname, 'public', 'profile.html'));
    } catch (error) {
        console.error('Error in /profile route:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.post('/login', passport.authenticate('local', {
    successRedirect: '/profile',
    failureRedirect: '/login',
    failureFlash: true, // Enable this if you want flash messages for failed login attempts
}));

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

        // Set a session variable to indicate that the user is logged in
        req.session.isLoggedIn = true;

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

// Logout route
app.get('/logout', (req, res) => {
    console.log('Logout route accessed.');
    // Clear the user's session
    // Inside the /logout route handler
    req.session.destroy((err) => {
        if (err) {
            console.error('Error destroying session:', err);
        }
        // Clear the session variables
        req.session.user = null;
        req.session.isLoggedIn = false;
        // Redirect to the login page
        res.redirect('/login');
    });
});


const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});
