const mongoose = require('mongoose');

const ScheduleAssignmentSchema = new mongoose.Schema({
    scheduleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Schedule',
      required: true
    },
    assignments: {
      type: Map,
      of: {
        hours: {
          monday: {
            hours: { type: Number, min: 0, max: 8 },
            from: String,
            to: String
          },
          tuesday: {
            hours: { type: Number, min: 0, max: 8 },
            from: String,
            to: String
          },
          wednesday: {
            hours: { type: Number, min: 0, max: 8 },
            from: String,
            to: String
          },
          thursday: {
            hours: { type: Number, min: 0, max: 8 },
            from: String,
            to: String
          },
          friday: {
            hours: { type: Number, min: 0, max: 8 },
            from: String,
            to: String
          },
          saturday: {
            hours: { type: Number, min: 0, max: 8 },
            from: String,
            to: String
          },
          sunday: {
            hours: { type: Number, min: 0, max: 8 },
            from: String,
            to: String
          }
        },
        totalHours: { type: Number, min: 0, max: 24 }
      }
    }
  }, {
    timestamps: true
  });
  
  module.exports = mongoose.model('ScheduleAssignment', ScheduleAssignmentSchema);
  