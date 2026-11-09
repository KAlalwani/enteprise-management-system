const mongoose = require("mongoose");
const { roles, departments } = require("./globalValues");

const employeeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
    name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  id:{
    type: Number,
    unique: true, 
    sparse: true
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
