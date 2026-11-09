const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const rateLimit = require("express-rate-limit");
const User = require("../models/User.js");
const Employee = require("../models/Employee.js");

const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 10 });

router.get("/sign-up", (req, res) => res.render("auth/sign-up.ejs"));

router.post("/sign-up", async (req, res) => {
  try {
    const { username, password, confirmPassword, id, CPR } = req.body;
    if (password !== confirmPassword) return res.send("Password and Confirm Password must match");
    if (await User.findOne({ username })) return res.send("Username already taken.");

    const employee = await Employee.findOne({ id, CPR });
    if (!employee) return res.send("Employee ID and CPR do not match any employee.");
    if (employee.user) return res.send("This employee already has an account.");

    const user = await User.create({ username, password: await bcrypt.hash(password, 10) });
    employee.user = user._id;
    await employee.save();
    res.redirect("/auth/sign-in");
  } catch (err) {
    console.log(err);
    res.status(500).send("Something went wrong during registration.");
  }
});

router.get("/sign-in", (req, res) => res.render("auth/sign-in.ejs"));

router.post("/sign-in", loginLimiter, async (req, res) => {
  try {
    const user = await User.findOne({ username: req.body.username });
    const valid = user && (await bcrypt.compare(req.body.password, user.password));
    if (!valid) return res.send("Login failed. Please try again.");

    const employee = await Employee.findOne({ user: user._id });
    req.session.user = { username: user.username, _id: user._id, role: employee?.role };
    res.redirect("/");
  } catch (err) {
    console.log(err);
    res.status(500).send("Login failed. Please try again.");
  }
});

router.get("/sign-out", (req, res) => {
  req.session.destroy(() => res.redirect("/"));
});

module.exports = router;