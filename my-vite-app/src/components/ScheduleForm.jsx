import React, {useState} from "react";
import PropTypes from "prop-types";


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
      },
      kitchenClasses: [],
      itvClasses: []

    });

    const [numKitchenClasses, setNumKitchenClasses] = useState(0);
    const [numITVClasses, setNumITVClasses] = useState(0);


    const handleKitchenClassChange = (index, field, value) => {
      const updatedClasses = [...formData.kitchenClasses];
      if (!updatedClasses[index]) {
        updatedClasses[index] = { className: "", room: "", day: "", hours: "" };
      }
      updatedClasses[index] = {
        ...updatedClasses[index],
        [field]: value
      };
      setFormData(prevData => ({
        ...prevData,
        kitchenClasses: updatedClasses
      }));
    };
  
    const handleITVClassChange = (index, field, value) => {
      const updatedClasses = [...formData.itvClasses];
      if (!updatedClasses[index]) {
        updatedClasses[index] = { className: "", room: "", day: "", hours: "" };
      }
      updatedClasses[index] = {
        ...updatedClasses[index],
        [field]: value
      };
      setFormData(prevData => ({
        ...prevData,
        itvClasses: updatedClasses
      }));
    };

    
    const handleSubmit = (e) => {
      e.preventDefault();
    
      console.log("Raw formData:", formData); // Log raw data before filtering
    
      const cleanedFormData = {
        ...formData,
        kitchenClasses: formData.kitchenClasses.filter(classData => 
          classData && classData.className && classData.room && classData.day && classData.hours
        ),
        itvClasses: formData.itvClasses.filter(classData => 
          classData && classData.className && classData.room && classData.day && classData.hours
        ),
      };
    
      console.log("Cleaned formData:", cleanedFormData); // Log filtered data
    
      onSubmit(cleanedFormData);
    };

    const handleNumKitchenClassesChange = (e) => {
      const num = parseInt(e.target.value) || 0;
      setNumKitchenClasses(num);
      
      // Preserve existing class data when changing the number of classes
      const updatedClasses = Array(num).fill(null).map((_, index) => 
        formData.kitchenClasses[index] || { className: "", room: "", day: "", hours: "" }
      );
      
      setFormData(prevData => ({
        ...prevData,
        kitchenClasses: updatedClasses
      }));
    };
  
    const handleNumITVClassesChange = (e) => {
      const num = parseInt(e.target.value) || 0;
      setNumITVClasses(num);
      
      // Preserve existing class data when changing the number of classes
      const updatedClasses = Array(num).fill(null).map((_, index) => 
        formData.itvClasses[index] || { className: "", room: "", day: "", hours: "" }
      );
      
      setFormData(prevData => ({
        ...prevData,
        itvClasses: updatedClasses
      }));
    };

    const renderClassFields = (type, index) => {
      const isKitchen = type === "kitchen";
      const handleChange = isKitchen ? handleKitchenClassChange : handleITVClassChange;
      const classes = isKitchen ? formData.kitchenClasses : formData.itvClasses;
      const currentClass = classes[index] || { className: "", room: "", day: "", hours: "" };
  
      return (
        <div key={`${type}-${index}`} className="border p-3 mb-3 rounded">
          <h5>{isKitchen ? "Kitchen" : "ITV"} Class #{index + 1}</h5>
          <div className="row">
            <div className="col-md-6 mb-2">
              <label className="form-label">Class Name</label>
              <input
                type="text"
                className="form-control"
                value={currentClass.className}
                onChange={(e) => handleChange(index, "className", e.target.value)}
                required
              />
            </div>
            <div className="col-md-6 mb-2">
              <label className="form-label">Room</label>
              <input
                type="text"
                className="form-control"
                value={currentClass.room}
                onChange={(e) => handleChange(index, "room", e.target.value)}
                required
              />
            </div>
            <div className="col-md-6 mb-2">
              <label className="form-label">Day</label>
              <select
                className="form-control"
                value={currentClass.day}
                onChange={(e) => handleChange(index, "day", e.target.value)}
                required
              >
                <option value="">Select Day</option>
                <option value="Monday">Monday</option>
                <option value="Tuesday">Tuesday</option>
                <option value="Wednesday">Wednesday</option>
                <option value="Thursday">Thursday</option>
                <option value="Friday">Friday</option>
                <option value="Saturday">Saturday</option>
                <option value="Sunday">Sunday</option>
              </select>
            </div>
            <div className="col-md-6 mb-2">
              <label className="form-label">Hours</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. 9:00 AM - 12:00 PM"
                value={currentClass.hours}
                onChange={(e) => handleChange(index, "hours", e.target.value)}
                required
              />
            </div>
          </div>
        </div>
      );
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

                  {/* Kitchen Classes section */}
                  <div className="mt-4">
                    <h4 className="mb-3">Kitchen Classes</h4>
                    <div className="mb-3">
                      <label className="form-label">Number of Kitchen Classes</label>
                      <input
                        type="number"
                        className="form-control"
                        min="0"
                        value={numKitchenClasses}
                        onChange={handleNumKitchenClassesChange}
                      />
                    </div>
                    {[...Array(numKitchenClasses)].map((_, index) =>
                      renderClassFields("kitchen", index)
                    )}
                  </div>

                  {/* ITV Classes section */}
                  <div className="mt-4">
                    <h4 className="mb-3">ITV Classes</h4>
                    <div className="mb-3">
                      <label className="form-label">Number of ITV Classes</label>
                      <input
                        type="number"
                        className="form-control"
                        min="0"
                        value={numITVClasses}
                        onChange={handleNumITVClassesChange}
                      />
                    </div>
                    {[...Array(numITVClasses)].map((_, index) =>
                      renderClassFields("itv", index)
                    )}
                  </div>
                      <button type="submit" className="btn btn-primary">Create Schedule</button>
                    </form>
                  </div>
                );
              };

    ScheduleForm.propTypes = {
      onSubmit: PropTypes.func.isRequired
  };

    export default ScheduleForm;