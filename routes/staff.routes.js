const router = require("express").Router()
const isSignedIn = require('../middleware/is-signed-in')
const isAdmin = require('../middleware/is-admin')
const Employee = require('../models/Employee')
const Shift = require('../models/Shift')
const Absence = require('../models/Absence')
const PerformanceReview = require('../models/PerformanceReview')

const fail = (res, message) => res.status(400).render('error.ejs', { message })
const todayUTC = () => new Date(new Date().toISOString().split('T')[0])

router.use(isSignedIn)

// ---- Any signed-in employee: own schedule (read-only) ----
router.get('/me', async (req, res) => {
  const employee = await Employee.findOne({ user: req.session.user._id })
  if (!employee) return fail(res, 'No employee record is linked to your account.')

  const [shifts, absences, reviews] = await Promise.all([
    Shift.find({ employee: employee._id, date: { $gte: todayUTC() } }).sort({ date: 1, startTime: 1 }),
    Absence.find({ employee: employee._id }).sort({ startDate: -1 }),
    PerformanceReview.find({ employee: employee._id }).sort({ period: -1 })
  ])
  res.render('staff/my-staff.ejs', { employee, shifts, absences, reviews })
})

// ---- Everything below is admin-only ----
router.use(isAdmin)

// OVERVIEW
router.get('/', async (req, res) => {
  const now = new Date()
  const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1))

  const [employees, absenceAgg, ratingAgg] = await Promise.all([
    Employee.find().sort({ name: 1 }),
    Absence.aggregate([
      { $match: { startDate: { $gte: monthStart } } },
      { $group: { _id: '$employee', count: { $sum: 1 } } }
    ]),
    PerformanceReview.aggregate([
      { $group: { _id: '$employee', avg: { $avg: '$rating' }, count: { $sum: 1 } } }
    ])
  ])

  const absMap = new Map(absenceAgg.map(a => [String(a._id), a.count]))
  const revMap = new Map(ratingAgg.map(r => [String(r._id), r]))

  const rows = employees.map(e => {
    const r = revMap.get(String(e._id))
    return {
      name: e.name,
      department: e.department,
      absences: absMap.get(String(e._id)) || 0,
      avgRating: r ? r.avg.toFixed(2) : null,
      reviewCount: r ? r.count : 0
    }
  })
  res.render('staff/overview.ejs', { rows })
})

// SHIFTS
router.get('/shifts', async (req, res) => {
  const shifts = await Shift.find({ date: { $gte: todayUTC() } })
    .sort({ date: 1, startTime: 1 }).populate('employee')
  res.render('staff/shifts-list.ejs', { shifts })
})

router.get('/shifts/new', async (req, res) => {
  const employees = await Employee.find().sort({ name: 1 })
  res.render('staff/new-shift.ejs', { employees })
})

router.post('/shifts', async (req, res) => {
  const { employee, date, startTime, endTime, notes } = req.body
  const shiftDate = new Date(date)

  const clash = await Shift.findOne({
    employee, date: shiftDate,
    startTime: { $lt: endTime }, endTime: { $gt: startTime }
  })
  if (clash) return fail(res, 'This employee already has an overlapping shift.')

  await Shift.create({ employee, date: shiftDate, startTime, endTime, notes })
  res.redirect('/staff/shifts')
})

router.delete('/shifts/:id', async (req, res) => {
  await Shift.findByIdAndDelete(req.params.id)
  res.redirect('/staff/shifts')
})

// ABSENCES
router.get('/absences', async (req, res) => {
  const absences = await Absence.find().sort({ startDate: -1 }).populate('employee')
  res.render('staff/absences-list.ejs', { absences })
})

router.get('/absences/new', async (req, res) => {
  const employees = await Employee.find().sort({ name: 1 })
  res.render('staff/new-absence.ejs', { employees })
})

router.post('/absences', async (req, res) => {
  const { employee, startDate, endDate, type, reason } = req.body
  await Absence.create({
    employee, type, reason,
    startDate: new Date(startDate),
    endDate: new Date(endDate)
  })
  res.redirect('/staff/absences')
})

router.delete('/absences/:id', async (req, res) => {
  await Absence.findByIdAndDelete(req.params.id)
  res.redirect('/staff/absences')
})

// PERFORMANCE REVIEWS
router.get('/reviews', async (req, res) => {
  const reviews = await PerformanceReview.find().sort({ period: -1 }).populate('employee')
  res.render('staff/reviews-list.ejs', { reviews })
})

router.get('/reviews/new', async (req, res) => {
  const employees = await Employee.find().sort({ name: 1 })
  res.render('staff/new-review.ejs', { employees })
})

router.post('/reviews', async (req, res) => {
  const { employee, period, rating, notes } = req.body
  await PerformanceReview.create({
    employee, period, notes,
    rating: Number(rating),
    reviewedBy: req.session.user._id
  })
  res.redirect('/staff/reviews')
})

router.delete('/reviews/:id', async (req, res) => {
  await PerformanceReview.findByIdAndDelete(req.params.id)
  res.redirect('/staff/reviews')
})

module.exports = router