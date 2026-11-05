// imports
const express = require("express") //importing express package
const app = express() // creates a express application
const dotenv = require("dotenv").config() //this allows me to use my .env values in this file
const morgan = require('morgan')
const session = require('express-session');
const methodOverride = require('method-override')
const {MongoStore} = require("connect-mongo");
const connectToDB = require('./db.js')

// middleware imports
const isSignedIn = require("./middleware/is-signed-in.js");
const passEmployeeToView = require("./middleware/pass-employee-to-view.js");

// routes Imports
const authController = require("./routes/auth.routes.js");
const indexController = require("./routes/index.routes.js");
const enterpriseController = require("./routes/enterprise.routes.js");
const employeeController = require("./routes/employee.routes.js");
const productController = require("./routes/product.routes.js");
const serviceController = require("./routes/service.routes.js");


// Middleware
app.use(express.static('public')) // my app will serve all static files from public folder
app.use(express.urlencoded({ extended: false }));
app.use(morgan('dev'))
app.use(methodOverride('_method'))
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,

    store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI,
    collectionName: "sessions"
    }),

    cookie: {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 // 1 day
    }
  })
);
app.use(passEmployeeToView)










// Routes go here
app.use('/auth',authController)
app.use('/',indexController)
app.use('/enterprise', enterpriseController)
app.use('/employee', employeeController)
app.use('/products', productController)
app.use('/services', serviceController)




// connect to database and listen on Port 3000
async function startServer() {
    const PORT = process.env.PORT || 3000;
    await connectToDB();

    app.listen(PORT, () => {
        console.log(`App is running on port ${PORT}`);
    });
}

startServer();