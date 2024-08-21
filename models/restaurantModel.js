const mongoose = require('mongoose');

const restaurantModelSchema = new mongoose.Schema({
      name: {
      type: String, 
      required: true,
      trim: true
    },
    image:{
        type: String,
        required: true,
        trim: true
    },
    description:{
        type: String,
        required: true,
        trim: true
    },
    rating:{
        type: Number,
        required: true,
        trim: true
    }
  });
  
  // Create the model from the schema
  const restaurantModel = mongoose.model('restaurantModel', restaurantModelSchema);
  
  module.exports = restaurantModel;