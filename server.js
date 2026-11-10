// imports
const express = require("express"); //importing express package
const app = express(); // creates a express application
const dotenv = require("dotenv").config(); //this allows me to use my .env values in this file
const morgan = require("morgan");
const session = require("express-session");
const methodOverride = require("method-override");
const { MongoStore } = require("connect-mongo");
const connectToDB = require("./db.js");

// middleware imports
const isSignedIn = require("./middleware/is-signed-in.js");
const passEmployeeToView = require("./middleware/pass-user-to-view.js");

// routes Imports
const authController = require("./routes/auth.routes.js");
const indexController = require("./routes/index.routes.js");
const enterpriseController = require("./routes/enterprise.routes.js");
const employeeController = require("./routes/employee.routes.js");
const productController = require("./routes/product.routes.js");
const serviceController = require("./routes/service.routes.js");
const supplierController = require("./routes/supplier.routes.js");
const customerController = require("./routes/customer.routes.js");
const operationController = require("./routes/operation.routes.js");
const invoiceRoutes = require("./routes/invoice.routes.js");
const staffController = require('./routes/staff.routes.js');
const uploadController = require('./routes/upload.routes.js');

// Middleware
app.use(express.static("public")); // my app will serve all static files from public folder
app.use(express.urlencoded({ extended: false }));
app.use(morgan("dev"));
app.use(methodOverride("_method"));
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,

    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI,
      collectionName: "sessions",
    }),

    cookie: {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24, // 1 day
    },
  }),
);
app.use(passEmployeeToView);

// Routes go here
app.use("/auth", authController);
app.use("/", indexController);
app.use("/enterprise", enterpriseController);
app.use("/employee", employeeController);
app.use("/products", isSignedIn, productController);
app.use("/services", isSignedIn, serviceController);
app.use("/suppliers", isSignedIn, supplierController);
app.use("/customers", isSignedIn, customerController);
app.use("/operations", isSignedIn, operationController);
app.use("/invoices", isSignedIn, invoiceRoutes);
app.use('/staff', staffController)
app.use('/uploads', isSignedIn, uploadController)
// 404
app.use((req, res) => {
  res.status(404).render('error.ejs', { message: 'Page not found.' })
})

// Error handler
app.use((err, req, res, next) => {
  if (res.headersSent) return next(err)
  let status = 500
  let message = 'Something went wrong.'
  if (err.name === 'ValidationError') {
    status = 400
    message = Object.values(err.errors).map(e => e.message).join(' ')
  } else if (err.code === 11000) {
    status = 409
    message = `${Object.keys(err.keyValue)[0]} already exists.`
  } else if (err.name === 'CastError') {
    status = 404
    message = 'Not found.'
    } else if (err.name === 'MulterError' || err.status === 400) {
    status = 400
    message = err.code === 'LIMIT_FILE_SIZE' ? 'Image must be 2MB or smaller.' : err.message
  } else {
    console.error(err)
  }
  res.status(status).render('error.ejs', { message })
})

// connect to database and listen on Port 3000
async function startServer() {
  const PORT = process.env.PORT || 3000;
  await connectToDB();

  app.listen(PORT, () => {
    console.log(`App is running on port ${PORT}`);
  });
}

startServer();
