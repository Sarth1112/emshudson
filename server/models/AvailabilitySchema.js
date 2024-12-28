const mongoose = require('mongoose');

const AvailabilitySchema = new mongoose.Schema({
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true
  },
  scheduleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Schedule',
    required: true
  },
  availability: {
    monday: { from: String, to: String },
    tuesday: { from: String, to: String },
    wednesday: { from: String, to: String },
    thursday: { from: String, to: String },
    friday: { from: String, to: String },
    saturday: { from: String, to: String },
    sunday: { from: String, to: String }
  }
});
module.exports = mongoose.model('Availability', AvailabilitySchema);