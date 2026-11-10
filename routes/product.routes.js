const router = require("express").Router()
const Product = require("../models/Product.js");
const Enterprise = require("../models/Enterprise.js");
const {categorys} = require('../models/globalValues')
const Supplier = require('../models/Supplier.js')
const isAdmin = require('../middleware/is-admin.js')

// READ
router.get('/new', async (req,res)=>{
    const suppliers = await Supplier.find()
    res.render('product/new-product.ejs', {categorys, suppliers});
})

router.get('/', async (req,res)=>{
    const products = await Product.find()
    res.render('product/products-list.ejs', {products: products});
})
router.get('/:id', async (req,res)=>{
    const Foundroduct = await Product.findById(req.params.id).populate('supplier')
    console.log(Foundroduct)
    if (!Foundroduct) return next()
    res.render('product/product-details.ejs', {product: Foundroduct});
})

// CREATE
router.post('/', async (req,res)=>{
    console.log(req.body)
    console.log(req.session.product)
// This creates a new entry in the database with the information from the request body
    const createdProduct = await Product.create({ 
        name: req.body.name,
        supplier: req.body.supplier,
        stock: req.body.stock,
        price: req.body.price,
        unitPrice: req.body.unitPrice,
        category: req.body.category
    })

    res.redirect('/') // Redirect the product to homepage after entry is created
})

// UPDATE
router.get('/:id/edit', async (req,res)=>{
    const suppliers = await Supplier.find()
    const product = await Product.findById(req.params.id).populate('supplier')
    if (!product) return next()
    res.render('product/update-product.ejs', {product: product, suppliers});
})
router.put('/:id', async (req,res)=>{
    const updatedProduct = await Product.findByIdAndUpdate(req.params.id, {
        name: req.body.name,
        supplier: req.body.supplier,
        stock: req.body.stock,
        price: req.body.price,
        unitPrice: req.body.unitPrice,
        category: req.body.category
    }, {new: true, runValidators: true}) 
    res.redirect('/products') 
})

// DELETE
router.delete('/:id', isAdmin, async (req,res)=>{
    await Product.findByIdAndDelete(req.params.id)
    res.redirect('/')
})
module.exports = router;