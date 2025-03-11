import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ChevronDown, ChevronUp, Edit2, Save, X } from 'lucide-react';
import PropTypes from 'prop-types';


const ScheduleGenerator = ({ schedules, employees, availabilities }) => {
    const [selectedScheduleId, setSelectedScheduleId] = useState('');
    const [labs, setLabs] = useState([
        { id: 'L419', name: 'L419', campus: 'Journal Square', maxEmployees: 2 },
        { id: 'S217', name: 'S217', campus: 'Journal Square', maxEmployees: 2 },
        { id: 'N404', name: 'N404', campus: 'North Hudson', maxEmployees: 2 }
    ]);
    const [labRequirements, setLabRequirements] = useState({
        'L419': { maxEmployees: 2 },
        'S217': { maxEmployees: 2 },
        'N404': { maxEmployees: 2 }
    });
    const [generatedSchedule, setGeneratedSchedule] = useState([]);
    const [campusAssignments, setCampusAssignments] = useState({});
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const [expandedEmployees, setExpandedEmployees] = useState({});
    const [editingEmployee, setEditingEmployee] = useState(null);
    const [editedSchedule, setEditedSchedule] = useState({});
    const [displayFilter, setDisplayFilter] = useState('all'); // 'all', 'journal', 'north', 'both'

    useEffect(() => {
        // Initialize campus assignments based on employees
        if (employees.length > 0 && Object.keys(campusAssignments).length === 0) {
            const initialAssignments = {};
            employees.forEach(emp => {
                initialAssignments[emp._id] = emp.campus || 'both'; // Default to 'both' if not set
            });
            setCampusAssignments(initialAssignments);
        }
    }, [employees, campusAssignments]);

    const handleLabRequirementChange = (labId, field, value) => {
        setLabRequirements(prev => ({
            ...prev,
            [labId]: {
                ...prev[labId],
                [field]: parseInt(value) || 0
            }
        }));
    };

    const handleCampusAssignmentChange = (employeeId, campus) => {
        setCampusAssignments(prev => ({
            ...prev,
            [employeeId]: campus
        }));
    };

    const toggleEmployeeExpand = (employeeId) => {
        setExpandedEmployees(prev => ({
            ...prev,
            [employeeId]: !prev[employeeId]
        }));
    };

    const handleEditEmployee = (employee) => {
        setEditingEmployee(employee._id);
        // Initialize edited schedule with current schedule
        const currentSchedule = generatedSchedule.find(item => item.employeeId === employee._id) || {
            monday: { hours: '' },
            tuesday: { hours: '' },
            wednesday: { hours: '' },
            thursday: { hours: '' },
            friday: { hours: '' },
            saturday: { hours: '' },
            sunday: { hours: '' }
        };
        
        setEditedSchedule(currentSchedule);
    };

    const handleSaveEdit = async (employeeId) => {
        try {
            // Update the generated schedule with edited values
            const updatedSchedule = generatedSchedule.map(schedule => 
                schedule.employeeId === employeeId ? 
                { ...schedule, ...editedSchedule } : 
                schedule
            );
            
            setGeneratedSchedule(updatedSchedule);
            setEditingEmployee(null);
            
            // Here you would also update the database with the new schedule
            // await axios.put(`http://localhost:3001/employee-schedules/${employeeId}`, editedSchedule);
            
            setMessage({ type: 'success', text: 'Schedule updated successfully' });
        } catch (error) {
            console.error('Error updating schedule:', error);
            setMessage({ type: 'error', text: 'Failed to update schedule' });
        }
    };

    const handleCancelEdit = () => {
        setEditingEmployee(null);
    };

    const calculateTotalHours = (schedule) => {
        const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
        let total = 0;
        
        days.forEach(day => {
            if (schedule[day] && schedule[day].hours) {
                const hoursStr = schedule[day].hours;
                if (hoursStr.includes('-')) {
                    const [start, end] = hoursStr.split('-').map(time => {
                        const [hourStr, minuteStr] = time.trim().split(':');
                        let hour = parseInt(hourStr);
                        const minute = parseInt(minuteStr || '0');
                        const isPM = time.trim().toLowerCase().includes('pm');
                        
                        if (isPM && hour < 12) hour += 12;
                        if (!isPM && hour === 12) hour = 0;
                        
                        return hour + (minute / 60);
                    });
                    
                    total += end - start;
                }
            }
        });
        
        return Math.round(total * 10) / 10; // Round to 1 decimal place
    };

    const formatHours = (hoursString) => {
        if (!hoursString) return '';
        return hoursString;
    };

    const handleScheduleChange = (day, value) => {
        setEditedSchedule(prev => ({
            ...prev,
            [day]: { ...prev[day], hours: value }
        }));
    };

    const generateSchedule = async () => {
        if (!selectedScheduleId) {
            setMessage({ type: 'error', text: 'Please select a schedule template' });
            return;
        }

        setLoading(true);
        setMessage(null);

        try {
            // Get selected schedule details
            const selectedSchedule = schedules.find(s => s._id === selectedScheduleId);
            if (!selectedSchedule) {
                throw new Error('Selected schedule not found');
            }

            console.log("All availabilities before filtering:", availabilities);
            console.log("Selected schedule:", selectedSchedule);

            console.log("Looking for:", selectedScheduleId, selectedSchedule.term, selectedSchedule.year)
            // Get employee availabilities for the selected schedule
           // Get employee availabilities for the selected schedule
            const scheduleAvailabilities = availabilities.filter(
                a => (a.scheduleId === selectedScheduleId) || 
                    (a.scheduleTerm === selectedSchedule.term && 
                    parseInt(a.scheduleYear) === selectedSchedule.year)
            );
            console.log("Filtered availabilities:", scheduleAvailabilities);

            if (scheduleAvailabilities.length === 0) {
                setMessage({ type: 'error', text: 'No availabilities found for selected schedule' });
                setLoading(false);
                return;
            }

            // Create the schedule based on availabilities, campus assignments, and lab requirements
            const newSchedule = generateScheduleAlgorithm(
                employees, 
                scheduleAvailabilities, 
                campusAssignments,
                labRequirements,
                selectedSchedule
            );

            setGeneratedSchedule(newSchedule);
            
            // Save the generated schedule to the database
            // await axios.post('http://localhost:3001/employee-schedules', {
            //     scheduleId: selectedScheduleId,
            //     employeeSchedules: newSchedule
            // });

            setMessage({ type: 'success', text: 'Schedule generated successfully' });
        } catch (error) {
            console.error('Error generating schedule:', error);
            setMessage({ type: 'error', text: `Failed to generate schedule: ${error.message}` });
        } finally {
            setLoading(false);
        }
    };

    const generateScheduleAlgorithm = (employees, availabilities, campusAssignments, labRequirements, selectedSchedule) => {
        // This is a simplified algorithm - you will need to implement a more sophisticated one
        const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
        const employeeSchedules = [];
        const labAssignments = {
            'L419': { assignments: {} },
            'S217': { assignments: {} },
            'N404': { assignments: {} }
        };
        
        // Group availabilities by employee
        const employeeAvailability = {};
        availabilities.forEach(avail => {
            employeeAvailability[avail.employeeId] = avail.availability;
        });
        
        // For each employee, create an initial empty schedule
        employees.forEach(employee => {
            const employeeSchedule = {
                employeeId: employee._id,
                employeeRealId: employee.id, // Add this line to store the employee's real ID
                employeeName: employee.name,
                totalHours: 0,
                assignedLab: determineBestLab(employee._id, campusAssignments),
            };
            
            // Initialize each day
            days.forEach(day => {
                employeeSchedule[day] = { hours: '' };
            });
            
            employeeSchedules.push(employeeSchedule);
        });
        
        // Assign shifts based on availability and campus assignment
        employees.forEach(employee => {
            const campus = campusAssignments[employee._id] || 'both';
            const availability = employeeAvailability[employee._id];
            const employeeSchedule = employeeSchedules.find(s => s.employeeId === employee._id);
            
            if (!availability || !employeeSchedule) return;
            
            // Determine which labs this employee can work in
            const eligibleLabs = [];
            if (campus === 'Journal Square' || campus === 'both') {
                eligibleLabs.push('L419', 'S217');
            }
            if (campus === 'North Hudson' || campus === 'both') {
                eligibleLabs.push('N404');
            }
            
            // Assign hours for each day (simplified)
            days.forEach(day => {
                if (availability[day] && availability[day].from && availability[day].to) {
                    // Skip if employee already has 24 hours
                    if (employeeSchedule.totalHours >= 24) return;
                    
                    // Format the hours (simplified)
                    const from = formatTimeToAmPm(availability[day].from);
                    const to = formatTimeToAmPm(availability[day].to);
                    const hoursString = `${from} - ${to}`;
                    
                    // Calculate hours (simplified)
                    const fromHour = convertTimeToDecimal(availability[day].from);
                    const toHour = convertTimeToDecimal(availability[day].to);
                    const hours = toHour - fromHour;
                    
                    // Skip if this would put employee over 24 hours
                    if (employeeSchedule.totalHours + hours > 24) return;
                    
                    // Assign to a lab randomly from eligible labs (simplified)
                    const lab = eligibleLabs[Math.floor(Math.random() * eligibleLabs.length)];
                    
                    // Set the schedule
                    employeeSchedule[day] = { 
                        hours: hoursString,
                        lab: lab
                    };
                    
                    // Update total hours
                    employeeSchedule.totalHours += hours;
                    
                    // Update lab assignments
                    if (!labAssignments[lab].assignments[day]) {
                        labAssignments[lab].assignments[day] = [];
                    }
                    labAssignments[lab].assignments[day].push({
                        employeeId: employee._id,
                        employeeName: employee.name,
                        from: availability[day].from,
                        to: availability[day].to
                    });
                }
            });
            
            // Calculate actual total hours based on assigned shifts
            employeeSchedule.totalHours = calculateTotalHours(employeeSchedule);
        });
        
        return employeeSchedules;
    };
    
    const determineBestLab = (employeeId, campusAssignments) => {
        const campus = campusAssignments[employeeId];
        
        if (campus === 'Journal Square') {
            return Math.random() < 0.5 ? 'L419' : 'S217';
        } else if (campus === 'North Hudson') {
            return 'N404';
        } else {
            // For 'both', randomly assign one of the three labs
            const labs = ['L419', 'S217', 'N404'];
            return labs[Math.floor(Math.random() * labs.length)];
        }
    };
    
    const formatTimeToAmPm = (time) => {
        if (!time) return '';
        
        const [hours, minutes] = time.split(':');
        let hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        
        hour = hour % 12;
        hour = hour || 12; // the hour '0' should be '12'
        
        return `${hour}:${minutes} ${ampm}`;
    };
    
    const convertTimeToDecimal = (time) => {
        if (!time) return 0;
        
        const [hours, minutes] = time.split(':');
        return parseInt(hours) + (parseInt(minutes) / 60);
    };

    const filteredSchedule = generatedSchedule.filter(employee => {
        if (displayFilter === 'all') return true;
        if (displayFilter === 'journal') return campusAssignments[employee.employeeId] === 'Journal Square';
        if (displayFilter === 'north') return campusAssignments[employee.employeeId] === 'North Hudson';
        if (displayFilter === 'both') return campusAssignments[employee.employeeId] === 'both';
        return true;
    });

    const saveScheduleToDatabase = async () => {
        try {
            setLoading(true);
            
            // Save the final schedule to the database
            await axios.post('http://localhost:3001/employee-schedules', {
                scheduleId: selectedScheduleId,
                employeeSchedules: generatedSchedule
            });
            
            setMessage({ type: 'success', text: 'Schedule saved to database successfully' });
        } catch (error) {
            console.error('Error saving schedule:', error);
            setMessage({ type: 'error', text: 'Failed to save schedule to database' });
        } finally {
            setLoading(false);
        }
    };

    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

    return (
        <div className="container">
            <h2 className="mb-4">Generate Employee Schedule</h2>
            
            {message && (
                <div className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-danger'} mb-4`}>
                    {message.text}
                </div>
            )}
            
            <div className="row mb-4">
                <div className="col">
                    <label className="form-label">Select Schedule Template</label>
                    <select 
                        className="form-select" 
                        value={selectedScheduleId}
                        onChange={(e) => setSelectedScheduleId(e.target.value)}
                    >
                        <option value="">Select a schedule...</option>
                        {schedules.map(schedule => (
                            <option key={schedule._id} value={schedule._id}>
                                {schedule.term} {schedule.year}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
            
            <div className="card mb-4">
                <div className="card-header">
                    <h5>Lab Requirements</h5>
                </div>
                <div className="card-body">
                    <div className="row">
                        {labs.map(lab => (
                            <div key={lab.id} className="col-md-4">
                                <div className="card">
                                    <div className="card-header">
                                        <h6>{lab.name} - {lab.campus}</h6>
                                    </div>
                                    <div className="card-body">
                                        <div className="mb-3">
                                            <label className="form-label">Max Employees at Once</label>
                                            <input
                                                type="number"
                                                className="form-control"
                                                value={labRequirements[lab.id].maxEmployees}
                                                onChange={(e) => handleLabRequirementChange(lab.id, 'maxEmployees', e.target.value)}
                                                min="1"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            
            <div className="card mb-4">
                <div className="card-header">
                    <h5>Employee Campus Assignments</h5>
                </div>
                <div className="card-body" style={{maxHeight: '300px', overflowY: 'auto'}}>
                    <table className="table table-striped">
                        <thead>
                            <tr>
                                <th>Employee</th>
                                <th>Campus Assignment</th>
                            </tr>
                        </thead>
                        <tbody>
                            {employees.map(employee => (
                                <tr key={employee._id}>
                                    <td>{employee.name}</td>
                                    <td>
                                        <select
                                            className="form-select"
                                            value={campusAssignments[employee._id] || 'both'}
                                            onChange={(e) => handleCampusAssignmentChange(employee._id, e.target.value)}
                                        >
                                            <option value="Journal Square">Journal Square Only</option>
                                            <option value="North Hudson">North Hudson Only</option>
                                            <option value="both">Both Campuses</option>
                                        </select>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            
            <div className="d-grid mb-4">
                <button 
                    className="btn btn-primary"
                    onClick={generateSchedule}
                    disabled={loading || !selectedScheduleId}
                >
                    {loading ? 'Generating...' : 'Generate Schedule'}
                </button>
            </div>
            
            {generatedSchedule.length > 0 && (
                <div className="card mb-4">
                    <div className="card-header d-flex justify-content-between align-items-center">
                        <h5>Generated Schedule</h5>
                        <div className="d-flex align-items-center">
                            <div className="me-2">
                                <select 
                                    className="form-select" 
                                    value={displayFilter}
                                    onChange={(e) => setDisplayFilter(e.target.value)}
                                >
                                    <option value="all">All Employees</option>
                                    <option value="journal">Journal Square Only</option>
                                    <option value="north">North Hudson Only</option>
                                    <option value="both">Both Campuses</option>
                                </select>
                            </div>
                            <button 
                                className="btn btn-success"
                                onClick={saveScheduleToDatabase}
                                disabled={loading}
                            >
                                Save Schedule to Database
                            </button>
                        </div>
                    </div>
                    <div className="card-body">
                        <div className="table-responsive">
                            <table className="table table-bordered">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Name</th>
                                        <th>Mon</th>
                                        <th>Tue</th>
                                        <th>Wed</th>
                                        <th>Thu</th>
                                        <th>Fri</th>
                                        <th>Sat</th>
                                        <th>Sun</th>
                                        <th>Total Hours</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredSchedule.map(employee => (
                                        <React.Fragment key={employee.employeeId}>
                                            <tr>
                                                <td>{employee.employeeRealId || employee.employeeId}</td>
                                                <td>{employee.employeeName}</td>
                                                {days.map(day => (
                                                    <td key={day}>
                                                        {editingEmployee === employee.employeeId ? (
                                                            <input
                                                                type="text"
                                                                className="form-control form-control-sm"
                                                                value={editedSchedule[day]?.hours || ''}
                                                                onChange={(e) => handleScheduleChange(day, e.target.value)}
                                                                placeholder="9:00 AM - 5:00 PM"
                                                            />
                                                        ) : (
                                                            <div>
                                                                {formatHours(employee[day]?.hours)}
                                                                {employee[day]?.lab && (
                                                                    <div><small className="text-muted">{employee[day].lab}</small></div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </td>
                                                ))}
                                                <td>{employee.totalHours}</td>
                                                <td>
                                                    {editingEmployee === employee.employeeId ? (
                                                        <div className="btn-group">
                                                            <button 
                                                                className="btn btn-sm btn-success"
                                                                onClick={() => handleSaveEdit(employee.employeeId)}
                                                            >
                                                                <Save size={16} />
                                                            </button>
                                                            <button 
                                                                className="btn btn-sm btn-secondary"
                                                                onClick={handleCancelEdit}
                                                            >
                                                                <X size={16} />
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <div className="btn-group">
                                                            <button 
                                                                className="btn btn-sm btn-primary" 
                                                                onClick={() => handleEditEmployee(employee)}
                                                            >
                                                                <Edit2 size={16} />
                                                            </button>
                                                            <button 
                                                                className="btn btn-sm btn-secondary"
                                                                onClick={() => toggleEmployeeExpand(employee.employeeId)}
                                                            >
                                                                {expandedEmployees[employee.employeeId] ? 
                                                                    <ChevronUp size={16} /> : 
                                                                    <ChevronDown size={16} />
                                                                }
                                                            </button>
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                            {expandedEmployees[employee.employeeId] && (
                                                <tr>
                                                    <td colSpan="11" className="p-0">
                                                        <div className="bg-light p-3">
                                                            <h6>Original Availability</h6>
                                                            <table className="table table-sm">
                                                                <thead>
                                                                    <tr>
                                                                        <th>Day</th>
                                                                        <th>From</th>
                                                                        <th>To</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    {days.map(day => {
                                                                        // Get the selected schedule details
                                                                        const selectedSchedule = schedules.find(s => s._id === selectedScheduleId);
                                                                        
                                                                        // Find availability using the same logic as the schedule generation
                                                                        const availability = availabilities.find(a => 
                                                                            a.employeeId === employee.employeeId && 
                                                                            (a.scheduleId === selectedScheduleId || 
                                                                            (a.scheduleTerm === selectedSchedule?.term && 
                                                                            parseInt(a.scheduleYear) === selectedSchedule?.year))
                                                                        );
                                                                        
                                                                        return (
                                                                            <tr key={day}>
                                                                                <td>{day.charAt(0).toUpperCase() + day.slice(1)}</td>
                                                                                <td>
                                                                                    {availability?.availability[day]?.from ? 
                                                                                        formatTimeToAmPm(availability.availability[day].from) : 
                                                                                        'Not Available'}
                                                                                </td>
                                                                                <td>
                                                                                    {availability?.availability[day]?.to ? 
                                                                                        formatTimeToAmPm(availability.availability[day].to) : 
                                                                                        'Not Available'}
                                                                                </td>
                                                                            </tr>
                                                                        );
                                                                    })}
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

ScheduleGenerator.propTypes = {
    schedules: PropTypes.arrayOf(
        PropTypes.shape({
            _id: PropTypes.string.isRequired,
            term: PropTypes.string.isRequired,
            year: PropTypes.oneOfType([
                PropTypes.string,
                PropTypes.number
            ]).isRequired
        })
    ).isRequired,
    employees: PropTypes.arrayOf(
        PropTypes.shape({
            _id: PropTypes.string.isRequired,
            name: PropTypes.string.isRequired,
            campus: PropTypes.string
        })
    ).isRequired,
    availabilities: PropTypes.arrayOf(
        PropTypes.shape({
            employeeId: PropTypes.string.isRequired,
            scheduleId: PropTypes.string, // Made optional
            scheduleTerm: PropTypes.string,
            scheduleYear: PropTypes.string,
            availability: PropTypes.object.isRequired
        })
    ).isRequired
};

export default ScheduleGenerator;