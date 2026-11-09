const router = require("express").Router()
const Employee = require("../models/Employee");
const Supplier = require("../models/Supplier");
const Product = require("../models/Product");
const Invoice = require("../models/Invoice");
const Service = require("../models/Service");
const Customer = require("../models/Customer");
const Enterprise = require("../models/Enterprise");
const { roles, departments, features } = require("../models/globalValues");

router.get('/', async (req,res)=>{
    const enterprise = await Enterprise.findOne()
    res.render('operations/operations-list.ejs', {enterprise: enterprise, roles,departments, features});
})
module.exports = router;
