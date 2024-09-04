const mongoose = require('mongoose');
const { Schema } = mongoose;
const { v4: uuidv4 } = require('uuid');
// Define the reservation schema
const orderSchema = new Schema({
  date: {
    type: Date,
    required: true
  },
  time: {
    type: String, // Storing time as string in HH:mm format
    required: true,
    trim: true
  },
  orderID: {
    type: String,
    required: true,
    default: uuidv4
  },
  items: {
    type: [String],
    default: '',
    trim: true
  },
  restaurant: {
    type: String,
    required: true,
    trim: true
  },
  userID: {
    type: String,
    required: true,
    trim: true
  },
  total:{
    type: Number,
    required: true,
    trim: true
  },
  status:{
    type: String,
    trim: true,
    default: 'pending' 
  }
});

// Create the model using the schema
const orderModel = mongoose.model('orderModel', orderSchema);

module.exports = orderModel;
