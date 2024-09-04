const mongoose = require('mongoose');
const { Schema } = mongoose;

// Define the reservation schema
const reservationSchema = new Schema({
  date: {
    type: Date,
    required: true
  },
  time: {
    type: String, // Storing time as string in HH:mm format
    required: true,
    trim: true
  },
  numberOfGuests: {
    type: Number,
    required: true,
  },
  specialRequest: {
    type: String,
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
  }
});

// Create the model using the schema
const reservationModel = mongoose.model('reservationModel', reservationSchema);

module.exports = reservationModel;
