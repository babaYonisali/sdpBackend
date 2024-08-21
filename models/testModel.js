const mongoose = require('mongoose');

// Define the schema for the user request
const testModelSchema = new mongoose.Schema({
  userID: {
    type: String, 
    required: true,
    unique:true
  }
});

// Create the model from the schema
const testModel = mongoose.model('testModel', testModelSchema);

module.exports = testModel;