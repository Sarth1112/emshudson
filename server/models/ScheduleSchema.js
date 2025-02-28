const mongoose = require('mongoose');


const ScheduleSchema = new mongoose.Schema({
  term: { type: String, required: true },
  year: { type: Number, required: true },
  shifts: {  // Changed from shiftHours to shifts to match formData
    monday: { from: { type: String }, to: { type: String } },
    tuesday: { from: { type: String }, to: { type: String } },
    wednesday: { from: { type: String }, to: { type: String } },
    thursday: { from: { type: String }, to: { type: String } },
    friday: { from: { type: String }, to: { type: String } },
    saturday: { from: { type: String }, to: { type: String } },
    sunday: { from: { type: String }, to: { type: String } },
  },
  kitchenClasses: [{
    className: { type: String, required: true },
    room: { type: String, required: true },
    day: { type: String, required: true },
    hours: { type: String, required: true },
  }],
  itvClasses: [{
    className: { type: String, required: true },
    room: { type: String, required: true },
    day: { type: String, required: true },
    hours: { type: String, required: true },
  }],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Schedule', ScheduleSchema);