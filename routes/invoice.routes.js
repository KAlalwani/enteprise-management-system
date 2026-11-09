const router = require("express").Router()
const {categorys} = require('../models/globalValues.js')
const isSignedIn = require("../middleware/is-signed-in");

const Invoice = require('../models/Invoice');
const Product = require('../models/Product');
const Service = require('../models/Service');
const Customer = require('../models/Customer');
const Supplier = require('../models/Supplier');
// Display invoices
router.get('/', isSignedIn, async (req, res) => {
  const invoices = await Invoice.find()
    .populate('customer')
    .populate('supplier');

  res.render('invoice/invoice-list.ejs', { invoices });
});

// Display new invoice form
router.get('/new', isSignedIn, async (req, res) => {
  const customers = await Customer.find();
  const suppliers = await Supplier.find();
  const products = await Product.find();
  const services = await Service.find();

  res.render('invoice/new-invoice.ejs', {
    customers,
    suppliers,
    products,
    services
  });
});

// Create invoice
router.post('/', isSignedIn, async (req, res) => {
  try {
    const {
      transactionType,
      customer,
      supplier,
      products = [],
      services = [],
      description
    } = req.body;

    const productIds = Array.isArray(products) ? products : [products];
    const serviceIds = Array.isArray(services) ? services : [services];
   
    // Validate transaction
    if (!['Sale', 'Purchase'].includes(transactionType)) {
      return res.send('Invalid transaction type.');
    }

    if (transactionType === 'Purchase' && serviceIds.length) {
      return res.send('Purchases cannot contain services.');
    }

    if (transactionType === 'Sale' && !customer) {
      return res.send('Please select a customer.');
    }

    if (transactionType === 'Purchase' && !supplier) {
      return res.send('Please select a supplier.');
    }

    if (!productIds.length && !serviceIds.length) {
      return res.send('Please select at least one item.');
    }

    const items = [];
    let totalAmount = 0;

    // Add products
const quantities = req.body.quantities || {};
    for (const id of productIds) {
      const product = await Product.findById(id);

      if (!product) {
        return res.send('Product not found.');
      }

      const quantity = Number(quantities[id]);

      if (!Number.isInteger(quantity) || quantity < 1) {
        return res.send(`Invalid quantity for ${product.name}.`);
      }

      if (
        transactionType === 'Purchase' &&
        product.supplier.toString() !== supplier
      ) {
        return res.send('Product does not belong to this supplier.');
      }

      if (transactionType === 'Sale' && product.stock < quantity) {
        return res.send(`Not enough stock for ${product.name}.`);
      }

      const unitPrice = transactionType === 'Sale'
        ? product.price
        : product.unitPrice;

      const subtotal = quantity * unitPrice;

      items.push({
        product: product._id,
        name: product.name,
        quantity,
        unitPrice,
        subtotal
      });

      totalAmount += subtotal;

      if (transactionType === 'Sale') {
        product.stock -= quantity;
      } else {
        product.stock += quantity;
      }

      await product.save();
    }

    // Add services
    for (const id of serviceIds) {
      const service = await Service.findById(id);

      if (!service) {
        return res.send('Service not found.');
      }

      items.push({
        service: service._id,
        name: service.name,
        quantity: 1,
        unitPrice: service.price,
        subtotal: service.price
      });

      totalAmount += service.price;
    }

    // Create invoice
    const invoice = await Invoice.create({
      invoiceNumber: `INV-${Date.now()}`,
      transactionType,
      customer: transactionType === 'Sale' ? customer : undefined,
      supplier: transactionType === 'Purchase' ? supplier : undefined,
      items,
      totalAmount,
      amountPaid: 0,
      paymentStatus: 'Unpaid',
      description,
      createdBy: req.session.user._id
    });

    res.redirect(`/invoices/${invoice._id}`);

  } catch (error) {
    console.error(error);
    res.status(500).send('Error creating invoice.');
  }
});

// Show invoice details
router.get('/:invoiceId', isSignedIn, async (req, res) => {
  const invoice = await Invoice.findById(req.params.invoiceId)
    .populate('customer')
    .populate('supplier')
    .populate('items.product')
    .populate('items.service');

  if (!invoice) {
    return res.status(404).send('Invoice not found.');
  }

  res.render('invoice/invoice-details', { invoice });
});


module.exports = router;