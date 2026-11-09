const router = require("express").Router()
const Customer = require("../models/Customer.js");
const Enterprise = require("../models/Enterprise.js");
const {categorys} = require('../models/globalValues.js')
const Supplier = require('../models/Supplier.js')
const isAdmin = require('../middleware/is-admin.js')

// READ
router.get('/new', async (req,res)=>{
    res.render('customer/new-customer.ejs', {categorys});
})

router.get('/', async (req,res)=>{
    const customers = await Customer.find()
    res.render('customer/customers-list.ejs', {customers: customers});
})
router.get('/:id', async (req,res)=>{
    const Foundroduct = await Customer.findById(req.params.id)
    if (!customer) return next()
    res.render('customer/customer-details.ejs', {customer: Foundroduct});
})

// CREATE
router.post('/', async (req,res)=>{
    console.log(req.body)
    console.log(req.session.customer)
// This creates a new entry in the database with the information from the request body
    const createdCustomer = await Customer.create({ 
        name: req.body.name,
        phone: req.body.phone,
        email: req.body.email,
    })

    res.redirect('/') // Redirect the customer to homepage after entry is created
})

// UPDATE
router.get('/:id/edit', async (req,res)=>{
    const customer = await Customer.findById(req.params.id)
    if (!customer) return next()
    res.render('customer/update-customer.ejs', {customer: customer});
})
router.put('/:id', async (req,res)=>{
    const updatedCustomer = await Customer.findByIdAndUpdate(req.params.id, {
        name: req.body.name,
        phone: req.body.phone,
        email: req.body.email,
    }, {new: true, runValidators: true}) 
    res.redirect('/customers') 
})

// DELETE
router.delete('/:id',isAdmin, async (req,res)=>{
    await Customer.findByIdAndDelete(req.params.id)
    res.redirect('/')
})
module.exports = router;