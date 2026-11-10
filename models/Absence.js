const mongoose = require("mongoose");

const absenceSchema = new mongoose.Schema({
  employee: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Employee', 
    required: true 
},
  startDate: { 
    type: Date, 
    required: true 
},
  endDate: { 
    type: Date, 
    required: true 
},
  type: { 
    type: String, 
    enum: ['Sick', 'Annual Leave', 'Unpaid', 'Unexcused', 'Other'], 
    required: true 
},
  reason: { 
    type: String, 
    trim: true 
},
}, { timestamps: true });

absenceSchema.pre('validate', function () {
  if (this.startDate && this.endDate && this.endDate < this.startDate) {
    this.invalidate('endDate', 'End date cannot be before start date.');
  }
});

module.exports = mongoose.model("Absence", absenceSchema);