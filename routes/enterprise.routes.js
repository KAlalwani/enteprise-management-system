const router = require("express").Router()
const Enterprise = require("../models/Enterprise");
const { roles, departments, features } = require("../models/globalValues");

router.get('/', async (req,res)=>{
    const enterprise = await Enterprise.find()
    console.log(enterprise)
    res.render('enterprise/enterprise-details.ejs', {enterprise: enterprise});
})

router.post('/', async (req,res)=>{
    console.log(req.body)
    console.log(req.session.user)
// This creates a new entry in the database with the information from the request body
    const createdEnterprise = await Enterprise.create({ 
        name: req.body.name,
        features: $push(req.body.features),
        roles: $push(req.body.roles),
        departments: $push(req.body.departments),
        salariesDate: new Date(req.body.salariedDate)
    })

    res.redirect('/') // Redirect the user to homepage after entry is created
})

module.exports = router;