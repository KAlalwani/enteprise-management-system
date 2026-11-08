const express = require("express");
const router = express.Router();
const User = require("../models/User.js");
const bcrypt = require("bcrypt");
const Employee = require("../models/Employee.js");

// Sign up routes
router.get("/sign-up", (req, res) => {
  res.render("auth/sign-up.ejs");
});

router.post("/sign-up", async (req, res) => {
  try {
    const userInDatabase = await User.findOne({ username: req.body.username });
    if (userInDatabase) {
      return res.send("Username already taken.");
    }

    if (req.body.password !== req.body.confirmPassword) {
      return res.send("Password and Confirm Password must match");
    }
     foundEmployee = await Employee.findOne({
      id: req.body.id
    });

    if (!foundEmployee) {
      return res.send("User is not a vaild employee");
    }
        // 4. Check whether employee already has an account
    if (foundEmployee.user) {
      return res.send("This employee already has an account.");
    }
    const hashedPassword = bcrypt.hashSync(req.body.password, 10);
    req.body.password = hashedPassword;

    // validation logic

    const user = await User.create(
{      username: req.body.username,
      password: req.body.password}
    );
    
    // 7. Link User to Employee
    foundEmployee.user = user._id;
    await foundEmployee.save();

    // 8. Redirect
    res.redirect("/auth/sign-in");

  } catch (err) {
    console.log(err);
    res.status(500).send("Something went wrong during registration.");
  }
});

// Sign in routes
router.get("/sign-in", (req, res) => {
  res.render("auth/sign-in.ejs");
});

router.post("/sign-in", async (req, res) => {
  // First, get the user from the database
  const userInDatabase = await User.findOne({ username: req.body.username });
  if (!userInDatabase) {
    return res.send("Login failed. Please try again.");
  }

  // There is a user! Time to test their password with bcrypt
  const validPassword = bcrypt.compareSync(
    req.body.password,
    userInDatabase.password,
  );
  if (!validPassword) {
    return res.send("Login failed. Please try again.");
  }

  // There is a user AND they had the correct password. Time to make a session!
  // Avoid storing the password, even in hashed format, in the session
  // If there is other data you want to save to `req.session.user`, do so here!
  req.session.user = {
    username: userInDatabase.username,
    _id: userInDatabase._id,
  };

  res.redirect("/");
});

router.get("/sign-out", (req, res) => {
  req.session.destroy();
  res.redirect("/");
});

module.exports = router;
