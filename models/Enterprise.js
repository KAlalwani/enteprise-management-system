const mongoose = require("mongoose");
const { roles, departments, features } = require("./globalValues");

const enterpriseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  features: {
    type: [String],
    enum: features,
    required: true,
  },
  roles: {
    type: [String],
    enum: roles, 
    required: true,
  },
  departments: {
    type: [String],
    enum: departments,
  },
  salariesDate: {
    type: Date,
    required: true,
  },
}, {timestamps: true});

const Enterprise = mongoose.model("Enterprise", enterpriseSchema);

module.exports = Enterprise;
