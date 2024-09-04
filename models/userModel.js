const mongoose = require('mongoose');

const userModelSchema = new mongoose.Schema({
      userID: {
      type: String, 
      required: true,
      trim: true
    },
    credits:{
        type: Number,
        trim: true,
        default:120
    },
    role:{
        type: String,
        trim: true,
        default:"student"
    }
  });
  
  // Create the model from the schema
  const userModel = mongoose.model('userModel', userModelSchema);
  
  module.exports = userModel;