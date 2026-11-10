const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
  employee: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Employee', 
    required: true 
},
  period: { 
    type: String, 
    required: true, 
    match: [/^\d{4}-(0[1-9]|1[0-2])$/, 'Period must be YYYY-MM.'] 
},
  rating: { 
    type: Number, 
    required: true, 
    min: 1, 
    max: 5 
},
  notes: { 
    type: String, 
    trim: true 
},
  reviewedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
},
}, { timestamps: true });

module.exports = mongoose.model("PerformanceReview", reviewSchema);