const express = require('express');
const mongoose = require('mongoose');
const app = express();
const router = express.Router();
const path = require('path');
const bcrypt = require('bcrypt');
const flash = require('express-flash');
const session = require('express-session');
require('dotenv').config();
const bodyParser = require('body-parser');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const MongoDBStore = require('connect-mongodb-session')(session);
const config = require('./config/config.js');



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

app.use(flash());

app.set('view engine', 'ejs'); // Set EJS as the view engine
app.set('views', path.join(__dirname, 'views')); // Specify the directory where your views are located

// Parse JSON payloads from Stripe webhooks
app.use('/stripe-webhook', bodyParser.raw({ type: 'application/json' }));

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
app.use(express.static(path.join(__dirname, 'public')));

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

const stripe = require('stripe')(config.stripe.secretKey);

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
});

const User = mongoose.model('User', userSchema);

app.use(router);


// Define a function to retrieve the user's subscription status
async function checkSubscriptionStatus(email) {
    try {
        // Log the input email for debugging
        console.log('Checking subscription status for email:', email);
        
        // Retrieve the customer from Stripe using the email as a unique identifier
        const customers = await stripe.customers.list({
            email: email,
            limit: 1,
        });
    
        // Check if a customer with the given email exists in Stripe
        if (customers.data.length === 1) {
            // Customer found, now retrieve their subscription status
            const customer = customers.data[0];
    
            // Check if the customer has an active subscription
            if (customer.subscriptions.data.length > 0 && customer.subscriptions.data[0].status === 'active') {
                console.log('User is subscribed.');
                // Show or enable content for subscribed users
                return true; // Return true for subscribed users
            } else {
                console.log('User is not subscribed.');
                // Display a message or alternative content for non-subscribed users
                return false; // Return false for non-subscribed users
            }
        } else {
            console.log('User is not found in Stripe.');
            // Handle the case where the user is not found in Stripe
            return false; // Return false for users not found in Stripe
        }
    } catch (error) {
        console.error('Error checking subscription status:', error);
        return false; // Return false in case of an error
    }
}

app.post('/stripe-webhook', async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;
  
    try {
        event = stripeInstance.webhooks.constructEvent(req.body, sig, config.stripe.webhookSecret);
    } catch (err) {
        console.error('Webhook signature verification failed.', err);
        return res.status(400).end();
    }
  
    // Declare customerId outside the switch statement
    let customerId;
  
    // Handle the event based on its type
    switch (event.type) {
      case 'customer.subscription.created':
        // Extract the customer ID from the subscription event
        customerId = event.customer;
  
        try {
          // Find the user in your database by their customer ID
          const user = await UserData.findOne({ customerId });
  
          if (user) {
            // Update the user's subscription status to true
            user.subscriptionStatus = true;
  
            // Save the updated user record back to the database
            await user.save();
  
            console.log(`Subscription created for user with customerId: ${customerId}`);
          } else {
            console.log(`User not found for customerId: ${customerId}`);
          }
        } catch (error) {
          console.error('Error handling subscription created event:', error);
        }
        break;
      case 'customer.subscription.updated':
        // Extract the customer ID and new subscription status from the event
        customerId = event.customer;
        const newSubscriptionStatus = event.data.object.status === 'active'; // Adjust this based on Stripe's status values
  
        try {
          // Find the user in your database by their customer ID
          const user = await UserData.findOne({ customerId });
  
          if (user) {
            // Update the user's subscription status based on the new status
            user.subscriptionStatus = newSubscriptionStatus;
  
            // Save the updated user record back to the database
            await user.save();
  
            console.log(`Subscription updated for user with customerId: ${customerId}`);
          } else {
            console.log(`User not found for customerId: ${customerId}`);
          }
        } catch (error) {
          console.error('Error handling subscription updated event:', error);
        }
        break;
      case 'customer.subscription.deleted':
        // Extract the customer ID from the event
        customerId = event.customer;
  
        try {
          // Find the user in your database by their customer ID
          const user = await UserData.findOne({ customerId });
  
          if (user) {
            // Update the user's subscription status to indicate they are no longer subscribed
            user.subscriptionStatus = false;
  
            // Save the updated user record back to the database
            await user.save();
  
            console.log(`Subscription deleted for user with customerId: ${customerId}`);
          } else {
            console.log(`User not found for customerId: ${customerId}`);
          }
        } catch (error) {
          console.error('Error handling subscription deleted event:', error);
        }
        break;
      default:
        // Handle other webhook events or ignore them
    }
  
    // Return a 200 OK response to acknowledge receipt of the event
    res.status(200).end();
});  

app.get('/data', (req, res) => {
    // Check the 'Accept' header
    const acceptHeader = req.get('Accept');
  
    // Handle JSON requests
    if (acceptHeader.includes('application/json')) {
      const jsonData = { message: 'This is JSON data.' };
      res.json(jsonData);
    }
    // Handle HTML requests
    else if (acceptHeader.includes('text/html')) {
      const htmlResponse = '<html><body><h1>This is an HTML response.</h1></body></html>';
      res.send(htmlResponse);
    }
    // Handle other content types or unsupported requests
    else {
      res.status(406).send('Not Acceptable');
    }
});

app.get('/profile/check-subscription', async (req, res) => {
    try {
        // Check the user's subscription status using the checkSubscriptionStatus function
        const userId = req.user.id;
        const isSubscribed = await checkSubscriptionStatus(userId);

        // Determine the response format based on the "Accept" header
        const acceptHeader = req.get('Accept');

        if (acceptHeader.includes('application/json')) {
            // Respond with JSON data
            res.header('Content-Type', 'application/json'); // Set the Content-Type
            res.json({ isSubscribed });
        } else {
            // Respond with HTML content
            res.header('Content-Type', 'text/html'); // Set the Content-Type
            res.sendFile(path.join(__dirname, 'public', 'profile.html'));
        }        
    } catch (error) {
        console.error('Error in /profile/check-subscription route:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.get('/check-subscription-status', async (req, res) => {
    // Extract the user's email from the request
    const userEmail = req.query.email; // You may use a different way to pass the email

    if (!userEmail) {
        return res.status(400).json({ message: 'Email is required' });
    }

    try {
        // Find the user in your database by their email
        const user = await UserData.findOne({ email: userEmail });

        if (user) {
            // Check the subscription status in Stripe using the user's email
            const stripeCustomer = await stripe.customers.retrieve(user.email);

            // Check the subscription status using the Stripe customer object
            // You may need to modify this part based on your Stripe subscription setup
            if (stripeCustomer.subscriptions && stripeCustomer.subscriptions.data.length > 0) {
                return res.status(200).json({ message: `User with email ${userEmail} is subscribed` });
            } else {
                return res.status(200).json({ message: `User with email ${userEmail} is not subscribed` });
            }
        } else {
            return res.status(404).json({ message: `User not found for email: ${userEmail}` });
        }
    } catch (error) {
        console.error('Error checking subscription status:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});


app.get('/', (req, res) => {
    // Set a cookie with SameSite=None and Secure flag
    res.cookie('myCookie', 'cookieValue', {
      sameSite: 'None',
      secure: true, // Only send over HTTPS
    });
  
    // Serve your homepage.html file
    res.sendFile(path.join(__dirname, 'public', 'homepage.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html')); // Replace 'login.html' with the actual filename and path
});

app.get('/profile', isAuthenticated, async (req, res) => {
    try {
        console.log('Request received for /profile');

        // Check the user's subscription status in your database
        const userId = req.user.id;
        const isSubscribed = await checkSubscriptionStatus(userId);

        // Parse the Accept header to determine the client's preferred content type
        const acceptHeader = req.get('Accept');

        // Check if the client prefers JSON or has no specific preference (default to HTML)
        if (acceptHeader.includes('application/json')) {
            // Respond with JSON data
            res.json({ isSubscribed }); // You can include other data as needed
        } else {
            // Respond with HTML content (assuming profile.html is in the 'public' folder)
            if (isSubscribed) {
                console.log('User is subscribed');
                // Render the video for subscribed users
                res.sendFile(path.join(__dirname, 'public', 'videos', 'cows (1080p).mp4'));
            } else {
                console.log('User is not subscribed');
                // Render the user's profile without the video content
                res.sendFile(path.join(__dirname, 'public', 'profile.html'));
            }
        }
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

        // Create a customer in Stripe with the user's email
        const stripeCustomer = await stripe.customers.create({
            email: email, // Use the email from the form data
        });

        // Hash the user's password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new user in your database and associate the Stripe customer ID
        const newUser = new UserData({
            name,
            email,
            password: hashedPassword,
            customerId: stripeCustomer.id, // Store the Stripe customer ID
        });

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

// Logout route
app.post('/logout', (req, res) => {
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
