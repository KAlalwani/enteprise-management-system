const mongoose = require("mongoose");

const serviceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  category: {
    type: String,
    enum: ['Category1', 'Category2', 'Category3'], // Replace with actual category names
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
}, {timestamps: true});

const Service = mongoose.model("Service", serviceSchema);

module.exports = Service;
