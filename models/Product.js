const mongoose = require("mongoose");
const {categorys} = require('./globalValues')
const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  photo: { 
    type: String 
  },
  supplier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Supplier',
    required: true,
  },
  stock: {
    type: Number,
    required: true,
    min: 0
  },
  unitPrice: {
    type: Number,
    required: true,
    min: 0
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  category: {
    type: String,
    enum: categorys, // Replace with actual category names
  },
}, {timestamps: true});

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
