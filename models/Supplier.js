const mongoose = require("mongoose");

const supplierSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true, 
    lowercase: true, 
    match: [/^\S+@\S+\.\S+$/, 'Invalid email.']
  },
  phoneNumber: {
    type: Number,
    required: true,
    match: [/^\+?\d{7,15}$/, 'Invalid phone number.']
  },
  IBAN: {
    type: String,
    required: true,
  },
}, {timestamps: true});

const Supplier = mongoose.model("Supplier", supplierSchema);

module.exports = Supplier;
