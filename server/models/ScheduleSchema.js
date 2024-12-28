const mongoose = require('mongoose');

const ScheduleSchema = new mongoose.Schema({
  term: { type: String, required: true },
  year: { type: Number, required: true },
  shiftHours: {
    monday: { 
      from: { type: String, required: true },
      to: { type: String, required: true }
    },
    tuesday: { 
      from: { type: String, required: true },
      to: { type: String, required: true }
    },
    wednesday: { 
      from: { type: String, required: true },
      to: { type: String, required: true }
    },
    thursday: { 
      from: { type: String, required: true },
      to: { type: String, required: true }
    },
    friday: { 
      from: { type: String, required: true },
      to: { type: String, required: true }
    },
    saturday: { 
      from: { type: String, required: true },
      to: { type: String, required: true }
    },
    sunday: { 
      from: { type: String, required: true },
      to: { type: String, required: true }
    }
  },

});

module.exports = mongoose.model('Schedule', ScheduleSchema);