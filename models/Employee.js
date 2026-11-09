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
    min: 0
  },
  CPR: {
    type: Number,
    required: true,
    unique: true,
    match: [/^\d{9}$/, 'CPR must be 9 digits.']
  },
  phoneNumber: {
    type: Number,
    required: true,
    unique: true,
    match: [/^\+?\d{7,15}$/, 'Invalid phone number.']
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
    trim: true, 
    lowercase: true, 
    match: [/^\S+@\S+\.\S+$/, 'Invalid email.']
  },
  experience: {
    type: Number,
    required: true,
    min: 0
  },
}, {timestamps: true});

const Employee = mongoose.model("Employee", employeeSchema);

module.exports = Employee;
