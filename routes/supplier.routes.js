const router = require("express").Router()
const Supplier = require("../models/Supplier.js");
const Enterprise = require("../models/Enterprise.js");
const isAdmin = require('../middleware/is-admin.js')

// READ
router.get('/new', async (req,res)=>{
    res.render('supplier/new-supplier.ejs');
})

router.get('/', async (req,res)=>{
    const suppliers = await Supplier.find()
    res.render('supplier/suppliers-list.ejs', {suppliers: suppliers});
})
router.get('/:id', async (req,res)=>{
    const foundSupplier = await Supplier.findById(req.params.id)
    if (!foundSupplier) return next()
    res.render('supplier/supplier-details.ejs', {supplier: Foundroduct});
})

// CREATE
router.post('/', async (req,res)=>{
    console.log(req.body)
    console.log(req.session.supplier)
// This creates a new entry in the database with the information from the request body
    const createdSupplier = await Supplier.create({ 
        name: req.body.name,
        email: req.body.email,
        phoneNumber: req.body.phoneNumber,
        IBAN: req.body.IBAN,
    })

    res.redirect('/') // Redirect the supplier to homepage after entry is created
})

// UPDATE
router.get('/:id/edit', async (req,res)=>{
    const enterprise = await Enterprise.findOne()
    console.log(enterprise)
    const supplier = await Supplier.findById(req.params.id)
    if (!supplier) return next()
    res.render('supplier/update-supplier.ejs', {supplier: supplier, enterprise:enterprise});
})
router.put('/:id', async (req,res)=>{
    const updatedSupplier = await Supplier.findByIdAndUpdate(req.params.id, {
        name: req.body.name,
        email: req.body.email,
        phoneNumber: req.body.phoneNumber,
        IBAN: req.body.IBAN
    }, {new: true, runValidators: true}) 
    res.redirect('/suppliers') 
})

// DELETE
router.delete('/:id', isAdmin, async (req,res)=>{
    await Supplier.findByIdAndDelete(req.params.id)
    res.redirect('/')
})
module.exports = router;