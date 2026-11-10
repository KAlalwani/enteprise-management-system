const router = require("express").Router()
const isAdmin = require('../middleware/is-admin')
const Invoice = require('../models/Invoice')
const Product = require('../models/Product')
const Service = require('../models/Service')
const Customer = require('../models/Customer')
const Supplier = require('../models/Supplier')

const round3 = n => Math.round(n * 1000) / 1000
const fail = (res, message) => res.status(400).render('error.ejs', { message })

// sign: +1 adds stock, -1 removes it. Atomic; undoes itself on failure.
async function adjustStock(items, sign) {
  const applied = []
  for (const item of items) {
    if (!item.product) continue
    const change = sign * item.quantity
    const filter = { _id: item.product }
    if (change < 0) filter.stock = { $gte: -change }
    const updated = await Product.findOneAndUpdate(filter, { $inc: { stock: change } })
    if (!updated) {
      await rollback(applied)
      return { error: `Not enough stock (or product missing) for ${item.name}.` }
    }
    applied.push({ product: item.product, change })
  }
  return { applied }
}

async function rollback(applied) {
  for (const a of applied) {
    await Product.findByIdAndUpdate(a.product, { $inc: { stock: -a.change } })
  }
}

// LIST
router.get('/', async (req, res) => {
  const invoices = await Invoice.find().sort({ createdAt: -1 })
    .populate('customer').populate('supplier')
  res.render('invoice/invoice-list.ejs', { invoices })
})

// NEW FORM
router.get('/new', async (req, res) => {
  const [customers, suppliers, products, services] = await Promise.all([
    Customer.find(), Supplier.find(), Product.find(), Service.find()
  ])
  res.render('invoice/new-invoice.ejs', { customers, suppliers, products, services })
})

// CREATE
router.post('/', async (req, res) => {
  const { transactionType, customer, supplier, description } = req.body
  const productIds = [].concat(req.body.products || [])
  const serviceIds = [].concat(req.body.services || [])
  const quantities = req.body.quantities || {}

  if (!['Sale', 'Purchase'].includes(transactionType)) return fail(res, 'Invalid transaction type.')
  if (transactionType === 'Purchase' && serviceIds.length) return fail(res, 'Purchases cannot contain services.')
  if (transactionType === 'Sale' && !customer) return fail(res, 'Please select a customer.')
  if (transactionType === 'Purchase' && !supplier) return fail(res, 'Please select a supplier.')
  if (!productIds.length && !serviceIds.length) return fail(res, 'Please select at least one item.')

  const items = []
  let totalAmount = 0

  for (const id of productIds) {
    const product = await Product.findById(id)
    if (!product) return fail(res, 'Product not found.')

const quantity = Number(quantities[id] ?? req.body[`quantities[${id}]`]);    if (!Number.isInteger(quantity) || quantity < 1) return fail(res, `Invalid quantity for ${product.name}.`)
    if (transactionType === 'Purchase' && product.supplier.toString() !== supplier) {
      return fail(res, `${product.name} does not belong to this supplier.`)
    }

    const unitPrice = transactionType === 'Sale' ? product.price : product.unitPrice
    const subtotal = round3(quantity * unitPrice)
    items.push({ product: product._id, name: product.name, quantity, unitPrice, subtotal })
    totalAmount += subtotal
  }

  for (const id of serviceIds) {
    const service = await Service.findById(id)
    if (!service) return fail(res, 'Service not found.')
    items.push({ service: service._id, name: service.name, quantity: 1, unitPrice: service.price, subtotal: service.price })
    totalAmount += service.price
  }

  const stock = await adjustStock(items, transactionType === 'Sale' ? -1 : 1)
  if (stock.error) return fail(res, stock.error)

  try {
      const invoice = await Invoice.create({
      invoiceNumber: `INV-${Date.now()}`,
      transactionType,
      customer: transactionType === 'Sale' ? customer : undefined,
      supplier: transactionType === 'Purchase' ? supplier : undefined,
      items,
      totalAmount: round3(totalAmount),
      description,
      createdBy: req.session.user._id
    })
    res.redirect(`/invoices/${invoice._id}`)
  } catch (err) {
    await rollback(stock.applied)
      console.error('Invoice creation error:', err)

    throw err
  }
})

// DETAILS
router.get('/:invoiceId', async (req, res, next) => {
  const invoice = await Invoice.findById(req.params.invoiceId)
    .populate('customer').populate('supplier')
  if (!invoice) return next()
  res.render('invoice/invoice-details.ejs', { invoice })
})

// RECORD PAYMENT
router.post('/:invoiceId/payments', async (req, res, next) => {
  const invoice = await Invoice.findById(req.params.invoiceId)
  if (!invoice) return next()
  if (invoice.status === 'Cancelled') return fail(res, 'Cannot pay a cancelled invoice.')

  const amount = round3(Number(req.body.amount))
  const remaining = round3(invoice.totalAmount - invoice.amountPaid)
  if (!(amount > 0) || amount > remaining) {
    return fail(res, `Amount must be between 0.001 and ${remaining} BHD.`)
  }

  invoice.amountPaid = round3(invoice.amountPaid + amount)
  invoice.paymentStatus = invoice.amountPaid >= invoice.totalAmount ? 'Paid' : 'Partially Paid'
  await invoice.save()
  res.redirect(`/invoices/${invoice._id}`)
})

// EDIT (description only)
router.get('/:invoiceId/edit', async (req, res, next) => {
  const invoice = await Invoice.findById(req.params.invoiceId)
  if (!invoice) return next()
  if (invoice.status === 'Cancelled') return fail(res, 'Cancelled invoices cannot be edited.')
  res.render('invoice/update-invoice.ejs', { invoice })
})

router.put('/:invoiceId', async (req, res, next) => {
  const invoice = await Invoice.findById(req.params.invoiceId)
  if (!invoice) return next()
  if (invoice.status === 'Cancelled') return fail(res, 'Cancelled invoices cannot be edited.')
  invoice.description = req.body.description
  await invoice.save()
  res.redirect(`/invoices/${invoice._id}`)
})

// CANCEL (admin) - restores stock
router.delete('/:invoiceId', isAdmin, async (req, res, next) => {
  const invoice = await Invoice.findById(req.params.invoiceId)
  if (!invoice) return next()
  if (invoice.status === 'Cancelled') return res.redirect(`/invoices/${invoice._id}`)

  const stock = await adjustStock(invoice.items, invoice.transactionType === 'Sale' ? 1 : -1)
  if (stock.error) return fail(res, stock.error)

  try {
    invoice.status = 'Cancelled'
    await invoice.save()
    res.redirect(`/invoices/${invoice._id}`)
  } catch (err) {
    await rollback(stock.applied)
    throw err
  }
})

module.exports = router