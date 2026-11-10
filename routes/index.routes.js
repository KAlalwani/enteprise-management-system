const router = require("express").Router()
const Employee = require("../models/Employee")
const Product = require("../models/Product")
const Customer = require("../models/Customer")
const Invoice = require("../models/Invoice")
const Shift = require("../models/Shift")
const Enterprise = require("../models/Enterprise")
const { roles, departments, features } = require("../models/globalValues")
// const { getSalaryInfo } = require("../utils/reminders")

const round3 = n => Math.round(n * 1000) / 1000

async function buildDashboard(isAdmin) {
  const now = new Date()
  const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1))
  const today = new Date(now.toISOString().split('T')[0])

  const [productCount, customerCount, products, owed, salesMonth, recent] = await Promise.all([
    Product.countDocuments(),
    Customer.countDocuments(),
    Product.find().select('stock reorderLevel'),
    Invoice.aggregate([
      { $match: { transactionType: 'Sale', status: { $ne: 'Cancelled' }, paymentStatus: { $ne: 'Paid' } } },
      { $group: {
          _id: null,
          count: { $sum: 1 },
          amount: { $sum: { $subtract: ['$totalAmount', { $ifNull: ['$amountPaid', 0] }] } }
      } }
    ]),
    Invoice.aggregate([
      { $match: { transactionType: 'Sale', status: { $ne: 'Cancelled' }, transactionDate: { $gte: monthStart } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]),
    Invoice.find().sort({ transactionDate: -1, _id: -1 }).limit(5)
      .populate('customer').populate('supplier')
  ])

  const dashboard = {
    productCount,
    customerCount,
    lowStock: products.filter(p => p.stock <= p.reorderLevel).length,
    owedCount: owed[0]?.count || 0,
    owedAmount: round3(owed[0]?.amount || 0),
    salesMonth: round3(salesMonth[0]?.total || 0),
    recent,
    admin: null
  }

  if (isAdmin) {
    const [employeeCount, shiftsToday, salary] = await Promise.all([
      Employee.countDocuments(),
      Shift.countDocuments({ date: today }),
    //   getSalaryInfo()
    ])
    dashboard.admin = { employeeCount, shiftsToday, salary }
  }
  return dashboard
}

router.get('/', async (req, res) => {
  const enterprise = await Enterprise.findOne()
  let dashboard = null
  if (enterprise && req.session.user) {
    dashboard = await buildDashboard(req.session.user.role === 'Admin')
  }
  res.render('homepage.ejs', { enterprise, roles, departments, features, dashboard })
})

module.exports = router