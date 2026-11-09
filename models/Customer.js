const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  phone: {
    type: Number,
    required: true,
    match: [/^\+?\d{7,15}$/, 'Invalid phone number.']
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true, 
    lowercase: true, 
    match: [/^\S+@\S+\.\S+$/, 'Invalid email.']
  },
}, {timestamps: true});

const Customer = mongoose.model("Customer", customerSchema);

module.exports = Customer;
