const mongoose = require('mongoose');

const menuItemModelSchema = new mongoose.Schema({
    name: {
      type: String, 
      required: true,
      trim: true
    },
    description:{
        type: String,
        required: true,
        trim: true
    },
    ingredients:{
        type: [String],
        required: true,
        trim: true
    },
    price:{
        type: Number,
        required: true,
        trim: true
    },
    dietary: {
        type: [String], // This defines dietary as an array of strings
        required: true, // You can set this to true if you want to enforce that this field is always present
        trim: true
      },
    restaurant:{
        type:String,
        required:true,
        trim:true
    }
  });
  
  // Create the model from the schema
  const menuItemModel = mongoose.model('menuItemModel', menuItemModelSchema);
  
  module.exports = menuItemModel;