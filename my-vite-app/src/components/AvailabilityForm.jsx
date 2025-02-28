import React, { useState, useEffect } from "react";
import axios from "axios";
import PropTypes from "prop-types";

const AvailabilityForm = ({ schedule, employeeId, existingAvailability, onClose }) => {
  const [availability, setAvailability] = useState({
    monday: { from: '', to: '' },
    tuesday: { from: '', to: '' },
    wednesday: { from: '', to: '' },
    thursday: { from: '', to: '' },
    friday: { from: '', to: '' },
    saturday: { from: '', to: '' },
    sunday: { from: '', to: '' }
  });
  const [errors, setErrors] = useState({});

  // Load existing availability data when component mounts
  useEffect(() => {
    if (existingAvailability) {
      setAvailability(existingAvailability.availability);
    }
  }, [existingAvailability]);

  // Your existing helper functions (timeToMinutes, isTimeWithinRange, etc.)...
  const timeToMinutes = (timeStr) => {
    if (!timeStr) return null;
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  };

    const isTimeWithinRange = (day, time, type) => {
    const scheduleTime = schedule.shiftHours[day];
    const inputMinutes = timeToMinutes(time);
    const scheduleStartMinutes = timeToMinutes(scheduleTime.from);
    const scheduleEndMinutes = timeToMinutes(scheduleTime.to);

    if (type === 'from') {
      return inputMinutes >= scheduleStartMinutes && inputMinutes < timeToMinutes(availability[day].to || scheduleTime.to);
    } else {
      return inputMinutes > timeToMinutes(availability[day].from || scheduleTime.from) && inputMinutes <= scheduleEndMinutes;
    }
  };

  const generateTimeOptions = (scheduleTime, type, day) => {
    const times = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute of [0, 15, 30, 45]) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        if (isTimeWithinRange(day, timeString, type)) {
          const displayHour = hour % 12 === 0 ? '12' : hour % 12;
          const ampm = hour < 12 ? 'AM' : 'PM';
          times.push(
            <option key={timeString} value={timeString}>
              {displayHour}:{minute.toString().padStart(2, '0')} {ampm}
            </option>
          );
        }
      }
    }
    return times;
  };

  const validateTime = (day, newTimes) => {
    const scheduleTime = schedule.shiftHours[day];
    const newErrors = {};

    if (newTimes.from && newTimes.to) {
      const availStartMinutes = timeToMinutes(newTimes.from);
      const availEndMinutes = timeToMinutes(newTimes.to);
      const scheduleStartMinutes = timeToMinutes(scheduleTime.from);
      const scheduleEndMinutes = timeToMinutes(scheduleTime.to);

      if (availStartMinutes < scheduleStartMinutes || availStartMinutes > scheduleEndMinutes) {
        newErrors.from = `Start time must be between ${scheduleTime.from} and ${scheduleTime.to}`;
      }
      if (availEndMinutes < scheduleStartMinutes || availEndMinutes > scheduleEndMinutes) {
        newErrors.to = `End time must be between ${scheduleTime.from} and ${scheduleTime.to}`;
      }
      if (availStartMinutes >= availEndMinutes) {
        newErrors.to = 'End time must be after start time';
      }
    }

    return newErrors;
  };

  const handleTimeChange = (day, type, value) => {
    const newTimes = {
      ...availability[day],
      [type]: value
    };

    const timeErrors = validateTime(day, newTimes);
    setErrors(prev => ({
      ...prev,
      [day]: timeErrors
    }));

    setAvailability({
      ...availability,
      [day]: newTimes
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const allErrors = {};
    let hasErrors = false;

    Object.entries(availability).forEach(([day, times]) => {
      if (times.from || times.to) {
        const timeErrors = validateTime(day, times);
        if (Object.keys(timeErrors).length > 0) {
          allErrors[day] = timeErrors;
          hasErrors = true;
        }
      }
    });

    if (hasErrors) {
      setErrors(allErrors);
      alert('Please correct the time errors before submitting.');
      return;
    }

    try {
       await axios.post(`http://localhost:3001/availability/${schedule._id}`, {
        employeeId,
        availability
      });
      
      alert(existingAvailability ? 'Availability updated successfully!' : 'Availability submitted successfully!');
      if (onClose) onClose();
    } catch (error) {
      console.error('Submission error:', error);
      alert(`Error submitting availability: ${error.response?.data?.error || error.message}`);
    }
  };

  return (
    <div className="card">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h3>Enter Availability for {schedule.term} {schedule.year}</h3>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          {Object.entries(availability).map(([day, times]) => (
            <div key={day} className="mb-4">
              <div className="row">
                <div className="col-2">
                  <label className="form-label">{day.charAt(0).toUpperCase() + day.slice(1)}</label>
                </div>
                <div className="col">
                  <div className="form-group">
                    <select
                      className={`form-control ${errors[day]?.from ? 'is-invalid' : ''}`}
                      value={times.from}
                      onChange={(e) => handleTimeChange(day, 'from', e.target.value)}
                    >
                      <option value="">Start Time</option>
                      {generateTimeOptions(schedule.shiftHours[day].from, 'from', day)}
                    </select>
                    {errors[day]?.from && (
                      <div className="invalid-feedback">{errors[day].from}</div>
                    )}
                  </div>
                </div>
                <div className="col">
                  <div className="form-group">
                    <select
                      className={`form-control ${errors[day]?.to ? 'is-invalid' : ''}`}
                      value={times.to}
                      onChange={(e) => handleTimeChange(day, 'to', e.target.value)}
                    >
                      <option value="">End Time</option>
                      {generateTimeOptions(schedule.shiftHours[day].to, 'to', day)}
                    </select>
                    {errors[day]?.to && (
                      <div className="invalid-feedback">{errors[day].to}</div>
                    )}
                  </div>
                </div>
              </div>
              {schedule.shiftHours[day] && (
                <small className="text-muted">
                  Schedule hours: {schedule.shiftHours[day].from} - {schedule.shiftHours[day].to}
                </small>
              )}
            </div>
          ))}
          <div className="d-flex justify-content-end">
            <button type="submit" className="btn btn-primary">
              {existingAvailability ? 'Update Availability' : 'Submit Availability'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

AvailabilityForm.propTypes = {
  schedule: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    term: PropTypes.string.isRequired,
    year: PropTypes.number.isRequired,
    shiftHours: PropTypes.objectOf(
      PropTypes.shape({
        from: PropTypes.string.isRequired,
        to: PropTypes.string.isRequired
      })
    ).isRequired
  }).isRequired,
  employeeId: PropTypes.string.isRequired,
  existingAvailability: PropTypes.shape({
    availability: PropTypes.object
  }),
  onClose: PropTypes.func.isRequired
};

export default AvailabilityForm;