const router = require("express").Router()
const Product = require("../models/Product.js");
const Enterprise = require("../models/Enterprise.js");
const {categorys} = require('../models/globalValues')
const Supplier = require('../models/Supplier.js')
const isAdmin = require('../middleware/is-admin.js')
const { upload, removeFile } = require("../middleware/upload")

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
router.post('/', upload.single('photo'), async (req,res)=>{
        try {
        await Product.create({
            name: req.body.name,
            supplier: req.body.supplier,
            stock: req.body.stock,
            unitPrice: req.body.unitPrice,
            price: req.body.price,
            category: req.body.category,
            photo: req.file?.filename
        })
    } catch (err) {
        await removeFile(req.file?.filename)
        throw err
    }
})

// UPDATE
router.get('/:id/edit', async (req,res)=>{
    const suppliers = await Supplier.find()
    const product = await Product.findById(req.params.id).populate('supplier')
    if (!product) return next()
    res.render('product/update-product.ejs', {product: product, suppliers});
})
router.put('/:id', upload.single('photo'), async (req,res)=>{
        const update = {
        name: req.body.name,
        supplier: req.body.supplier,
        stock: req.body.stock,
        unitPrice: req.body.unitPrice,
        price: req.body.price,
        category: req.body.category
    }
    if (req.file) update.photo = req.file.filename
    try {
        const old = await Product.findByIdAndUpdate(req.params.id, update, { runValidators: true })
        if (!old) { await removeFile(req.file?.filename); return next() }
        if (req.file) await removeFile(old.photo)
    } catch (err) {
        await removeFile(req.file?.filename)
        throw err
    }
    res.redirect('/products')
})

// DELETE
router.delete('/:id', isAdmin, async (req,res)=>{
    const removed = await Product.findByIdAndDelete(req.params.id)
    if (removed?.photo) await removeFile(removed.photo)
    res.redirect('/')
})
module.exports = router;