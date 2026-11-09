const mongoose = require("mongoose");

const invoiceSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true,
    unique: true
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Customer",
  },
  salesperson: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employee",
    },
    products: [ {
      type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
    }],
    productQuantities: [{
      type: Number,
      required: true,
      min: 1
    }],
    services: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Service",
    }],
    totalPrice: {
        type: Number,
        required: true,
        min: 0
    },


}, {timestamps: true});

const Invoice = mongoose.model("Invoice", invoiceSchema);

module.exports = Invoice;
