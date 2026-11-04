const router = require("express").Router()
const Enterprise = require("../models/Enterprise");
const { roles, departments, features } = require("../models/globalValues");

// READ
router.get('/', async (req,res)=>{
    const enterprise = await Enterprise.find()
    console.log(enterprise)
    res.render('enterprise/enterprise-details.ejs', {enterprise: enterprise});
})

// CREATE
router.post('/', async (req,res)=>{
    console.log(req.body)
    console.log(req.session.user)
// This creates a new entry in the database with the information from the request body
    const createdEnterprise = await Enterprise.create({ 
        name: req.body.name,
        features: req.body.features,
        roles: req.body.roles,
        departments: req.body.departments,
        salariesDate: new Date(req.body.salariedDate)
    })

    res.redirect('/') // Redirect the user to homepage after entry is created
})

// UPDATE
router.get('/:id/edit', async (req,res)=>{
    const enterprise = await Enterprise.findById(req.params.id)
    res.render('enterprise/update-enterprise.ejs', {enterprise: enterprise, roles,departments, features});
})
router.put('/:id', async (req,res)=>{
    const updatedEnterprise = await Enterprise.findByIdAndUpdate(req.params.id, {
        name: req.body.name,
        features: req.body.features,
        roles: req.body.roles,
        departments: req.body.departments,
        salariesDate: new Date(req.body.salariedDate)
    }, {new: true}) 
    res.redirect('/enterprise') 
})

// DELETE
router.delete('/:id', async (req,res)=>{
    await Enterprise.findByIdAndDelete(req.params.id)
    res.redirect('/')
})
module.exports = router;