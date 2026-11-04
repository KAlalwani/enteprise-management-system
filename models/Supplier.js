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
  },
  phoneNumber: {
    type: Number,
    required: true,
  },
  IBAN: {
    type: String,
    required: true,
  },
}, {timestamps: true});

const Supplier = mongoose.model("Supplier", supplierSchema);

module.exports = Supplier;
