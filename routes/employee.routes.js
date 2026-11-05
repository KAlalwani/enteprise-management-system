const router = require("express").Router()
const Employee = require("../models/Employee");
const Enterprise = require("../models/Enterprise.js");

// READ
router.get('/', async (req,res)=>{
    const employees = await Employee.find()
    console.log(employees)
    res.render('employee/employees-list.ejs', {employees: employees});
})

// CREATE
router.post('/', async (req,res)=>{
    console.log(req.body)
    console.log(req.session.employee)
// This creates a new entry in the database with the information from the request body
    const createdEmployee = await Employee.create({ 
        name: req.body.name,
        features: req.body.features,
        roles: req.body.roles,
        departments: req.body.departments,
        salariesDate: new Date(req.body.salariedDate)
    })

    res.redirect('/') // Redirect the employee to homepage after entry is created
})

router.get('/:id', async (req,res)=>{
    const foundEmployee = await Employee.findById(req.params.id) // Gets the one entry by its id
    res.render('employee/employee-details.ejs',{employee: foundEmployee})
})

// UPDATE
router.get('/:id/edit', async (req,res)=>{
    const enterprise = await Enterprise.findOne()
    console.log(enterprise)
    const employee = await Employee.findById(req.params.id)
    res.render('employee/update-employee.ejs', {employee: employee, enterprise:enterprise});
})
router.put('/:id', async (req,res)=>{
    const updatedEmployee = await Employee.findByIdAndUpdate(req.params.id, {
        name: req.body.name,
        salary: req.body.salary,
        role: req.body.roles,
        department: req.body.departments,
    }, {new: true}) 
    res.redirect('/employee') 
})

// DELETE
router.delete('/:id', async (req,res)=>{
    await Employee.findByIdAndDelete(req.params.id)
    res.redirect('/')
})
module.exports = router;