const router = require("express").Router()
const Service = require("../models/Service.js");
const Enterprise = require("../models/Enterprise.js");
const {categoryS} = require('../models/globalValues.js')
const isAdmin = require('../middleware/is-admin.js')

// READ
router.get('/new', async (req,res)=>{
    res.render('service/new-service.ejs', {categoryS});
})

router.get('/', async (req,res)=>{
    const services = await Service.find()
    res.render('service/services-list.ejs', {services: services});
})
router.get('/:id', async (req,res)=>{
    const Foundroduct = await Service.findById(req.params.id)
    if (!Foundroduct) return next()
    res.render('service/service-details.ejs', {service: Foundroduct});
})

// CREATE
router.post('/', async (req,res)=>{
    console.log(req.body)
    console.log(req.session.service)
// This creates a new entry in the database with the information from the request body
    const createdService = await Service.create({ 
        name: req.body.name,
        price: req.body.price,
        category: req.body.category
    })

    res.redirect('/') // Redirect the service to homepage after entry is created
})

// UPDATE
router.get('/:id/edit', async (req,res)=>{
    const enterprise = await Enterprise.findOne()
    console.log(enterprise)
    const service = await Service.findById(req.params.id)
    if (!service) return next()
    res.render('service/update-service.ejs', {service: service, enterprise:enterprise});
})
router.put('/:id', async (req,res)=>{
    const updatedService = await Service.findByIdAndUpdate(req.params.id, {
        name: req.body.name,
        price: req.body.price,
        category: req.body.category
    }, {new: true, runValidators: true}) 
    res.redirect('/services') 
})

// DELETE
router.delete('/:id', isAdmin, async (req,res)=>{
    await Service.findByIdAndDelete(req.params.id)
    res.redirect('/')
})
module.exports = router;