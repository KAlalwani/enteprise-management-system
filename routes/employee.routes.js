const router = require("express").Router()
const crypto = require("crypto")
const Employee = require("../models/Employee");
const Enterprise = require("../models/Enterprise.js");
const isSignedIn = require("../middleware/is-signed-in.js")
const isAdmin = require("../middleware/is-admin.js")
const bootstrapOrAdmin = require("../middleware/bootstrap-or-admin.js")
const Shift = require("../models/Shift")
const Absence = require("../models/Absence")
const PerformanceReview = require("../models/PerformanceReview")
const { upload, removeFile } = require("../middleware/upload")

async function generateEmployeeId() {
  while (true) {
    const id = crypto.randomInt(100000, 1000000)
    if (!(await Employee.exists({ id }))) return id
  }
}

router.get('/new', bootstrapOrAdmin(Employee), async (req, res) => {
  const enterprise = await Enterprise.findOne()
  res.render('employee/new-employee.ejs', { enterprise });
})

router.get('/', isSignedIn, isAdmin, async (req, res) => {
  const employees = await Employee.find()
  res.render('employee/employees-list.ejs', { employees });
})

router.post('/', bootstrapOrAdmin(Employee), upload.single('photo'), async (req, res) => {
  const { name, role, department, salary, CPR, email, IBAN, phoneNumber, experience } = req.body;
  const id = await generateEmployeeId()
  try {
    await Employee.create({
      name, role: req.isBootstrap ? 'Admin' : role,
      department, salary, CPR, email, IBAN, phoneNumber, experience, id,
      photo: req.file?.filename
    })
  } catch (err) {
    await removeFile(req.file?.filename)
    throw err
  }
  if (req.isBootstrap) {
    return res.send(`Admin created. Your Employee ID is ${id}. <a href="/auth/sign-up">Sign up</a>`)
  }
  res.redirect('/employee')
})

router.get('/:id', isSignedIn, isAdmin, async (req, res) => {
  const foundEmployee = await Employee.findById(req.params.id)
    if (!foundEmployee) return next()
  res.render('employee/employee-details.ejs', { employee: foundEmployee })
})

router.get('/:id/edit', isSignedIn, isAdmin, async (req, res) => {
  const enterprise = await Enterprise.findOne()
  const employee = await Employee.findById(req.params.id)
  if (!employee) return next()
  res.render('employee/update-employee.ejs', { employee, enterprise });
})

router.put('/:id', isSignedIn, isAdmin, upload.single('photo'), async (req, res, next) => {
  const update = {
    name: req.body.name, salary: req.body.salary,
    role: req.body.role, department: req.body.department
  }
  if (req.file) update.photo = req.file.filename
  try {
    const old = await Employee.findByIdAndUpdate(req.params.id, update, { runValidators: true })
    if (!old) { await removeFile(req.file?.filename); return next() }
    if (req.file) await removeFile(old.photo)
  } catch (err) {
    await removeFile(req.file?.filename)
    throw err
  }
  res.redirect('/employee')
})
router.delete('/:id', isSignedIn, isAdmin, async (req, res) => {
  await Promise.all([
    Shift.deleteMany({ employee: req.params.id }),
    Absence.deleteMany({ employee: req.params.id }),
    PerformanceReview.deleteMany({ employee: req.params.id })
  ])
  const removed = await Employee.findByIdAndDelete(req.params.id)
  if (removed?.photo) await removeFile(removed.photo)
  res.redirect('/employee')
})

module.exports = router;