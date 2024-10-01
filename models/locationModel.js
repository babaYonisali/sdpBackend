const mongoose = require('mongoose');

const locationModelSchema = new mongoose.Schema({
    name: {
      type: String, 
      required: true,
      trim: true
    },
    lat:{
        type: String,
        required: true,
    },
    long:{
        type: String,
        required: true
    }
  });
  
  // Create the model from the schema
  const locationModel = mongoose.model('locationModel', locationModelSchema);
  
  module.exports = locationModel;