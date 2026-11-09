const router = require("express").Router()
const crypto = require("crypto")
const Employee = require("../models/Employee");
const Enterprise = require("../models/Enterprise.js");
const isSignedIn = require("../middleware/is-signed-in.js")
const isAdmin = require("../middleware/is-admin.js")
const bootstrapOrAdmin = require("../middleware/bootstrap-or-admin.js")

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

router.post('/', bootstrapOrAdmin(Employee), async (req, res) => {
  const { name, role, department, salary, CPR, email, IBAN, phoneNumber, experience } = req.body;
  const id = await generateEmployeeId()
  await Employee.create({
    name, role: req.isBootstrap ? 'Admin' : role,
    department, salary, CPR, email, IBAN, phoneNumber, experience, id
  })
  if (req.isBootstrap) {
    return res.send(`Admin created. Your Employee ID is ${id}. <a href="/auth/sign-up">Sign up</a>`)
  }
  res.redirect('/employee')
})

router.get('/:id', isSignedIn, isAdmin, async (req, res) => {
  const foundEmployee = await Employee.findById(req.params.id)
  res.render('employee/employee-details.ejs', { employee: foundEmployee })
})

router.get('/:id/edit', isSignedIn, isAdmin, async (req, res) => {
  const enterprise = await Enterprise.findOne()
  const employee = await Employee.findById(req.params.id)
  res.render('employee/update-employee.ejs', { employee, enterprise });
})

router.put('/:id', isSignedIn, isAdmin, async (req, res) => {
  await Employee.findByIdAndUpdate(req.params.id, {
    name: req.body.name,
    salary: req.body.salary,
    role: req.body.roles,
    department: req.body.departments,
  }, { new: true })
  res.redirect('/employee')
})

router.delete('/:id', isSignedIn, isAdmin, async (req, res) => {
  await Employee.findByIdAndDelete(req.params.id)
  res.redirect('/employee')
})

module.exports = router;