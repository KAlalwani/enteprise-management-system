const express = require("express");
const router = express.Router();
const Employee = require("../models/Employee.js");
const bcrypt = require("bcrypt");
const Enterprise = require("../models/Enterprise.js");

// Sign up routes
router.get("/sign-up", async (req, res) => {
  const foundEnterprise = await Enterprise.findOne();
  res.render("auth/sign-up.ejs", { enterprise: foundEnterprise });
});

router.post("/sign-up", async (req, res) => {
  const employeeInDatabase = await Employee.findOne({ username: req.body.username });
  if (employeeInDatabase) {
    return res.send("Employeename already taken.");
  }

  if (req.body.password !== req.body.confirmPassword) {
    return res.send("Password and Confirm Password must match");
  }

  const hashedPassword = bcrypt.hashSync(req.body.password, 10);
  req.body.password = hashedPassword;

  // validation logic

  const employee = await Employee.create(req.body);
  res.redirect("/auth/sign-in");
});



// Sign in routes
router.get("/sign-in", (req, res) => {
  res.render("auth/sign-in.ejs");
});



router.post("/sign-in", async (req, res) => {
  // First, get the employee from the database
  const employeeInDatabase = await Employee.findOne({ username: req.body.username });
  if (!employeeInDatabase) {
    return res.send("Login failed. Please try again.");
  }

  // There is a employee! Time to test their password with bcrypt
  const validPassword = bcrypt.compareSync(
    req.body.password,
    employeeInDatabase.password
  );
  if (!validPassword) {
    return res.send("Login failed. Please try again.");
  }

  // There is a employee AND they had the correct password. Time to make a session!
  // Avoid storing the password, even in hashed format, in the session
  // If there is other data you want to save to `req.session.employee`, do so here!
  req.session.employee = {
    username: employeeInDatabase.username,
    _id: employeeInDatabase._id
  };

  res.redirect("/");
});


router.get("/sign-out", (req, res) => {
  req.session.destroy();
  res.redirect("/");
});





module.exports = router;
