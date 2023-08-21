const express = require('express');
const mongoose = require('mongoose');
const app = express();

//MongoDB Cluster URI
const uri = "mongodb+srv://dustinharp:CardioApe2023@cluster1.85j138f.mongodb.net/?retryWrites=true&w=majority"

//Fails or Connects to MongoDB
async function connect() {
    try {
        await mongoose.connect(uri);
        console.log("Connect to MongoDB");
    } catch (error) {
        console.error(error);
    }
}

//Calls connect function
connect();

//Listen to the Port that the server runs on
app.listen(3000, () => {
    console.log("Server started on port 3000");
})