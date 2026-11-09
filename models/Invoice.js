
const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
  invoiceNumber: {
    type: String,
    required: true,
    unique: true
  },

  transactionType: {
    type: String,
    enum: ['Sale', 'Purchase'],
    required: true
  },

  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer'
  },

  supplier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Supplier'
  },

  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },

    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service'
    },

    name: {
      type: String,
      required: true
    },

    quantity: {
      type: Number,
      required: true,
      min: 1
    },

    unitPrice: {
      type: Number,
      required: true,
      min: 0
    },

    subtotal: {
      type: Number,
      required: true,
      min: 0
    }
  }],

  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },

  amountPaid: {
    type: Number,
    default: 0,
    min: 0
  },

  paymentStatus: {
    type: String,
    enum: ['Unpaid', 'Partially Paid', 'Paid'],
    default: 'Unpaid'
  },

  transactionDate: {
    type: Date,
    default: Date.now
  },

  description: {
    type: String,
    trim: true
  },
  
  status: {
    type: String,
    enum: ['Active', 'Cancelled'],
    default: 'Active'
  },

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });

// Validate the relationship between transaction type and parties/items.
invoiceSchema.pre('validate', function () {
  if (this.transactionType === 'Sale') {
    if (!this.customer || this.supplier) {
      this.invalidate('customer', 'A sale requires a customer, not a supplier.');
    }
  }

  if (this.transactionType === 'Purchase') {
    if (!this.supplier || this.customer) {
      this.invalidate('supplier', 'A purchase requires a supplier, not a customer.');
    }
  }

  for (const item of this.items) {
    const hasProduct = !!item.product;
    const hasService = !!item.service;

    if (hasProduct === hasService) {
      this.invalidate(
        'items',
        'Each item must reference exactly one product or service.'
      );
    }

    if (this.transactionType === 'Purchase' && hasService) {
      this.invalidate('items', 'Purchases can only contain products.');
    }
  }
});

module.exports = mongoose.model('Invoice', invoiceSchema);
