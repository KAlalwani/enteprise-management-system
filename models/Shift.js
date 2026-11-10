const mongoose = require("mongoose");
const time = { 
    type: String, 
    required: true, 
    match: [/^([01]\d|2[0-3]):[0-5]\d$/, 'Time must be HH:MM.'] 
};

const shiftSchema = new mongoose.Schema({
  employee: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Employee', 
    required: true 
},
  date: { 
    type: Date, 
    required: true 
},
  startTime: time,
  endTime: time,
  notes: { 
    type: String, 
    trim: true 
},
}, { timestamps: true });

shiftSchema.pre('validate', function () {
  if (this.startTime && this.endTime && this.endTime <= this.startTime) {
    this.invalidate('endTime', 'End time must be after start time.');
  }
});

module.exports = mongoose.model("Shift", shiftSchema);