
import React from "react";
import { useState } from "react";


const AvailabilityForm = ({ schedule, employeeId, onSubmit }) => {
  const [availability, setAvailability] = useState({
    monday: { from: '', to: '' },
    tuesday: { from: '', to: '' },
    wednesday: { from: '', to: '' },
    thursday: { from: '', to: '' },
    friday: { from: '', to: '' },
    saturday: { from: '', to: '' },
    sunday: { from: '', to: '' }
  });

  const generateTimeOptions = () => {
    return [...Array(24)].map((_, hour) => (
      [0, 15, 30, 45].map(minute => {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        return (
          <option key={timeString} value={timeString}>
            {hour % 12 === 0 ? '12' : hour % 12}:{minute.toString().padStart(2, '0')} {hour < 12 ? 'AM' : 'PM'}
          </option>
        );
      })
    )).flat();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`http://localhost:3001/availability/${schedule._id}`, {
        employeeId,
        availability
      });
      alert('Availability submitted successfully!');
    } catch (error) {
      alert('Error submitting availability');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4">
      <h3>Enter Availability for {schedule.term} {schedule.year}</h3>
      {Object.entries(availability).map(([day, times]) => (
        <div key={day} className="row mb-3">
          <div className="col-2">
            <label>{day.charAt(0).toUpperCase() + day.slice(1)}</label>
          </div>
          <div className="col">
            <select
              className="form-control"
              value={times.from}
              onChange={(e) => setAvailability({
                ...availability,
                [day]: { ...times, from: e.target.value }
              })}
            >
              <option value="">Start Time</option>
              {generateTimeOptions(schedule.shiftHours[day].from)}
            </select>
          </div>
          <div className="col">
            <select
              className="form-control"
              value={times.to}
              onChange={(e) => setAvailability({
                ...availability,
                [day]: { ...times, to: e.target.value }
              })}
            >
              <option value="">End Time</option>
              {generateTimeOptions(schedule.shiftHours[day].to)}
            </select>
          </div>
        </div>
      ))}
      <button type="submit" className="btn btn-primary">Submit Availability</button>
    </form>
  );
};


export default AvailabilityForm;