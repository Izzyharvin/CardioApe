const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
});

const UserData = mongoose.model('UserData', userSchema);

module.exports = UserData;
