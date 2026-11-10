const router = require('express').Router()
const ExcelJS = require('exceljs')
const PDFDocument = require('pdfkit')
const isAdmin = require('../middleware/is-admin')
const Invoice = require('../models/Invoice')
const Product = require('../models/Product')
const Employee = require('../models/Employee')
const { drawTable } = require('../utils/pdf-table')

const XLSX_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
const money = n => Number(n || 0).toFixed(3)
const round3 = n => Math.round(n * 1000) / 1000
const day = d => (d ? new Date(d).toISOString().split('T')[0] : '')

async function sendWorkbook(res, wb, filename) {
  res.set({
    'Content-Type': XLSX_TYPE,
    'Content-Disposition': `attachment; filename="${filename}"`
  })
  await wb.xlsx.write(res)
  res.end()
}

function startPdf(res, filename, title) {
  const doc = new PDFDocument({ size: 'A4', margin: 40 })
  res.set({
    'Content-Type': 'application/pdf',
    'Content-Disposition': `attachment; filename="${filename}"`
  })
  doc.pipe(res)
  doc.font('Helvetica-Bold').fontSize(18).text(title)
  doc.font('Helvetica').fontSize(9).fillColor('#666666').text(`Generated ${day(new Date())}`)
  doc.fillColor('#000000').moveDown()
  return doc
}

const boldHeader = ws => {
  ws.getRow(1).font = { bold: true }
  ws.views = [{ state: 'frozen', ySplit: 1 }]
}

// ---------- INVOICES ----------
router.get('/invoices/xlsx', async (req, res) => {
  const invoices = await Invoice.find().sort({ transactionDate: -1 })
    .populate('customer').populate('supplier')

  const wb = new ExcelJS.Workbook()

  const ws = wb.addWorksheet('Invoices')
  ws.columns = [
    { header: 'Invoice #', key: 'number', width: 22 },
    { header: 'Date', key: 'date', width: 12, style: { numFmt: 'yyyy-mm-dd' } },
    { header: 'Type', key: 'type', width: 10 },
    { header: 'Status', key: 'status', width: 11 },
    { header: 'Customer / Supplier', key: 'party', width: 28 },
    { header: 'Total (BHD)', key: 'total', width: 13, style: { numFmt: '0.000' } },
    { header: 'Paid (BHD)', key: 'paid', width: 13, style: { numFmt: '0.000' } },
    { header: 'Remaining (BHD)', key: 'remaining', width: 16, style: { numFmt: '0.000' } },
    { header: 'Payment', key: 'payment', width: 15 }
  ]
  boldHeader(ws)

  const items = wb.addWorksheet('Items')
  items.columns = [
    { header: 'Invoice #', key: 'number', width: 22 },
    { header: 'Item', key: 'name', width: 30 },
    { header: 'Quantity', key: 'qty', width: 10 },
    { header: 'Unit Price (BHD)', key: 'unit', width: 16, style: { numFmt: '0.000' } },
    { header: 'Subtotal (BHD)', key: 'subtotal', width: 16, style: { numFmt: '0.000' } }
  ]
  boldHeader(items)

  invoices.forEach(inv => {
    ws.addRow({
      number: inv.invoiceNumber,
      date: inv.transactionDate,
      type: inv.transactionType,
      status: inv.status,
      party: inv.customer?.name || inv.supplier?.name || '',
      total: inv.totalAmount,
      paid: inv.amountPaid,
      remaining: inv.status === 'Cancelled' ? 0 : round3(inv.totalAmount - inv.amountPaid),
      payment: inv.paymentStatus
    })
    inv.items.forEach(i => items.addRow({
      number: inv.invoiceNumber, name: i.name, qty: i.quantity,
      unit: i.unitPrice, subtotal: i.subtotal
    }))
  })

  await sendWorkbook(res, wb, 'invoices.xlsx')
})

router.get('/invoices/:id/pdf', async (req, res, next) => {
  const invoice = await Invoice.findById(req.params.id)
    .populate('customer').populate('supplier')
  if (!invoice) return next()

  const doc = startPdf(res, `${invoice.invoiceNumber}.pdf`, `Invoice ${invoice.invoiceNumber}`)
  const party = invoice.customer
    ? ['Customer', invoice.customer.name]
    : ['Supplier', invoice.supplier?.name || '']

  doc.fontSize(11)
  doc.text(`Date: ${day(invoice.transactionDate)}`)
  doc.text(`Type: ${invoice.transactionType}`)
  doc.text(`Status: ${invoice.status}`)
  doc.text(`${party[0]}: ${party[1]}`)
  doc.moveDown()

  drawTable(doc, [
    { key: 'name', label: 'Item', width: 235 },
    { key: 'qty', label: 'Qty', width: 60, align: 'right' },
    { key: 'unit', label: 'Unit (BHD)', width: 110, align: 'right' },
    { key: 'subtotal', label: 'Subtotal (BHD)', width: 110, align: 'right' }
  ], invoice.items.map(i => ({
    name: i.name, qty: i.quantity, unit: money(i.unitPrice), subtotal: money(i.subtotal)
  })))

  const remaining = invoice.status === 'Cancelled' ? 0 : round3(invoice.totalAmount - invoice.amountPaid)
  doc.moveDown()
  doc.font('Helvetica-Bold').fontSize(12).text(`Total: ${money(invoice.totalAmount)} BHD`, { align: 'right' })
  doc.font('Helvetica').fontSize(11)
  doc.text(`Paid: ${money(invoice.amountPaid)} BHD`, { align: 'right' })
  doc.text(`Remaining: ${money(remaining)} BHD`, { align: 'right' })
  doc.text(`Payment status: ${invoice.paymentStatus}`, { align: 'right' })

  if (invoice.description) {
    doc.moveDown().text(`Notes: ${invoice.description}`, { align: 'left' })
  }
  doc.end()
})

// ---------- PRODUCTS / STOCK ----------
router.get('/products/xlsx', async (req, res) => {
  const products = await Product.find().sort({ name: 1 }).populate('supplier')

  const wb = new ExcelJS.Workbook()
  const ws = wb.addWorksheet('Products')
  ws.columns = [
    { header: 'Name', key: 'name', width: 30 },
    { header: 'Supplier', key: 'supplier', width: 26 },
    { header: 'Category', key: 'category', width: 16 },
    { header: 'Stock', key: 'stock', width: 10 },
    { header: 'Cost (BHD)', key: 'unitPrice', width: 13, style: { numFmt: '0.000' } },
    { header: 'Price (BHD)', key: 'price', width: 13, style: { numFmt: '0.000' } }
  ]
  boldHeader(ws)
  products.forEach(p => ws.addRow({
    name: p.name, supplier: p.supplier?.name || '', category: p.category || '',
    stock: p.stock, unitPrice: p.unitPrice, price: p.price
  }))

  await sendWorkbook(res, wb, 'products.xlsx')
})

router.get('/products/pdf', async (req, res) => {
  const products = await Product.find().sort({ name: 1 }).populate('supplier')
  const doc = startPdf(res, 'products.pdf', 'Products & Stock')

  drawTable(doc, [
    { key: 'name', label: 'Name', width: 160 },
    { key: 'supplier', label: 'Supplier', width: 110 },
    { key: 'category', label: 'Category', width: 80 },
    { key: 'stock', label: 'Stock', width: 45, align: 'right' },
    { key: 'unitPrice', label: 'Cost', width: 60, align: 'right' },
    { key: 'price', label: 'Price', width: 60, align: 'right' }
  ], products.map(p => ({
    name: p.name, supplier: p.supplier?.name || '', category: p.category || '',
    stock: p.stock, unitPrice: money(p.unitPrice), price: money(p.price)
  })))
  doc.end()
})

// ---------- EMPLOYEES (admin only; no CPR / IBAN) ----------
router.get('/employees/xlsx', isAdmin, async (req, res) => {
  const employees = await Employee.find().sort({ name: 1 })

  const wb = new ExcelJS.Workbook()
  const ws = wb.addWorksheet('Employees')
  ws.columns = [
    { header: 'Employee ID', key: 'id', width: 12 },
    { header: 'Name', key: 'name', width: 26 },
    { header: 'Role', key: 'role', width: 12 },
    { header: 'Department', key: 'department', width: 14 },
    { header: 'Salary (BHD)', key: 'salary', width: 14, style: { numFmt: '0.000' } },
    { header: 'Email', key: 'email', width: 28 },
    { header: 'Phone', key: 'phone', width: 16 },
    { header: 'Experience (yrs)', key: 'experience', width: 16 }
  ]
  boldHeader(ws)
  employees.forEach(e => ws.addRow({
    id: e.id, name: e.name, role: e.role, department: e.department || '',
    salary: e.salary, email: e.email, phone: String(e.phoneNumber), experience: e.experience
  }))

  await sendWorkbook(res, wb, 'employees.xlsx')
})

module.exports = router