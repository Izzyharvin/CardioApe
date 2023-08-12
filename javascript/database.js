const MongoClient = require('mongodb').MongoClient;
const uri = 'mongodb+srv://<username>:<password>@<cluster-url>/test?retryWrites=true&w=majority';

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

// Connect to the MongoDB database
client.connect(err => {
    if (err) {
        console.error('Error connecting to MongoDB:', err);
        return;
    }
    console.log('Connected to MongoDB');
    
    // Now you can perform database operations
});
