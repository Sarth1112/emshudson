import React, {useState} from "react";

const ScheduleForm = ({ onSubmit }) => {
    const [formData, setFormData] = useState({
      term: '',
      year: new Date().getFullYear(),
      shifts: {
        monday: { from: '', to: '' },
        tuesday: { from: '', to: '' },
        wednesday: { from: '', to: '' },
        thursday: { from: '', to: '' },
        friday: { from: '', to: '' },
        saturday: { from: '', to: '' },
        sunday: { from: '', to: '' }
      }
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
      };

    return (
        <div className="container mt-4">
          <form onSubmit={handleSubmit}>
            <div className="row mb-3">
              <div className="col">
                <label>Term</label>
                <select 
                  className="form-control"
                  value={formData.term}
                  onChange={(e) => setFormData({...formData, term: e.target.value})}
                >
                  <option value="">Select Term</option>
                  <option value="Spring">Spring</option>
                  <option value="Summer">Summer</option>
                  <option value="Fall">Fall</option>
                  <option value="Winter">Winter</option>
                </select>
              </div>
              <div className="col">
                <label>Year</label>
                <input
                  type="number"
                  className="form-control"
                  value={formData.year}
                  onChange={(e) => setFormData({...formData, year: e.target.value})}
                />
              </div>
            </div>
    
            {Object.entries(formData.shifts).map(([day, times]) => (
                <div key={day} className="row mb-3">
                    <div className="col-2">
                    <label>{day.charAt(0).toUpperCase() + day.slice(1)}</label>
                    </div>
                    <div className="col">
                    <select
                        className="form-control"
                        value={times.from}
                        onChange={(e) => setFormData({
                        ...formData,
                        shifts: {
                            ...formData.shifts,
                            [day]: { ...times, from: e.target.value }
                        }
                        })}
                    >
                        <option value="">Select Start Time</option>
                        {[...Array(24)].map((_, hour) => (
                        [0, 15, 30, 45].map(minute => {
                            const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
                            return (
                            <option key={timeString} value={timeString}>
                                {hour % 12 === 0 ? '12' : hour % 12}:{minute.toString().padStart(2, '0')} {hour < 12 ? 'AM' : 'PM'}
                            </option>
                            );
                        })
                        )).flat()}
                    </select>
                    </div>
                    <div className="col">
                    <select
                        className="form-control"
                        value={times.to}
                        onChange={(e) => setFormData({
                        ...formData,
                        shifts: {
                            ...formData.shifts,
                            [day]: { ...times, to: e.target.value }
                        }
                        })}
                    >
                        <option value="">Select End Time</option>
                        {[...Array(24)].map((_, hour) => (
                        [0, 15, 30, 45].map(minute => {
                            const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
                            return (
                            <option key={timeString} value={timeString}>
                                {hour % 12 === 0 ? '12' : hour % 12}:{minute.toString().padStart(2, '0')} {hour < 12 ? 'AM' : 'PM'}
                            </option>
                            );
                        })
                        )).flat()}
                    </select>
                    </div>
                </div>
                ))}
            <button type="submit" className="btn btn-primary">Create Schedule</button>
          </form>
        </div>
      );
    };

    export default ScheduleForm;