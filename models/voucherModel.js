const mongoose = require('mongoose');

// Define a new schema for the voucher model
const voucherModelSchema = new mongoose.Schema({
    credits:{
        type: Number,
        trim: true,
        default:120
    },
    vouch:{
        type: String,
        trim: true
    }
  });
  
  // Create the model from the schema
  const voucherModel = mongoose.model('voucherModel', voucherModelSchema);
  
  module.exports = voucherModel;