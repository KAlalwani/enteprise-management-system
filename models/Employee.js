const mongoose = require("mongoose");
const { roles, departments } = require("./globalValues");

const employeeSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
  },
    name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  role: {
    type: String,
    enum: roles,
    required: true,
  },
  department: {
    type: String,
    enum: departments,
  },
  salary: {
    type: Number,
    required: true,
  },
  CPR: {
    type: Number,
    required: true,
    unique: true,
  },
  phoneNumber: {
    type: Number,
    required: true,
    unique: true,
  },
  IBAN: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  experience: {
    type: Number,
    required: true,
  },
}, {timestamps: true});

const Employee = mongoose.model("Employee", employeeSchema);

module.exports = Employee;
