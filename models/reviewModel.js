const mongoose = require('mongoose');

const reviewModelSchema = new mongoose.Schema({
      restaurant: {
      type: String, 
      required: true,
      trim: true
    },
    comment:{
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
  const reviewModel = mongoose.model('reviewModel', reviewModelSchema);
  
  module.exports = reviewModel;