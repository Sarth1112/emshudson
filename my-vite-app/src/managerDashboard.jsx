import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronUp } from 'lucide-react';
import ScheduleForm from './components/ScheduleForm';
import ScheduleGenerator from './components/ScheduleGenerator';

const ManagerDashboard = () => {
    const [view, setView] = useState('hem');
    const [employees, setEmployees] = useState([]);
    const [message, setMessage] = useState(null);
    const [showScheduleForm, setShowScheduleForm] = useState(false);
    const [schedules, setSchedules] = useState([]);
    const [availabilities, setAvailabilities] = useState([]);
    const [loading, setLoading] = useState(false);
    const [expandedEmployees, setExpandedEmployees] = useState({});
    const [selectedSchedule, setSelectedSchedule] = useState(null);
    const [editingSchedule, setEditingSchedule] = useState(null);

    const navigate = useNavigate();

    useEffect(() => {
        if (view === 'employees') {
            axios.get('http://localhost:3001/employees')
                .then(response => setEmployees(response.data))
                .catch(error => {
                    console.error('Error fetching employees:', error);
                    setMessage({ type: 'error', text: 'Failed to fetch employees' });
                });
        } else if (view === 'schedule' || view === 'generateSchedule') {
            // Fetch schedules for both schedule and generateSchedule views
            axios.get('http://localhost:3001/schedules')
                .then(response => setSchedules(response.data))
                .catch(error => {
                    console.error('Error fetching schedules:', error);
                    setMessage({ type: 'error', text: 'Failed to fetch schedules' });
                });
    
            // For generateSchedule view, also fetch employees and availabilities
            if (view === 'generateSchedule') {
                setLoading(true);
                Promise.all([
                    axios.get('http://localhost:3001/employees'),
                    axios.get('http://localhost:3001/all-availabilities')
                ])
                    .then(([employeesResponse, availabilitiesResponse]) => {
                        setEmployees(employeesResponse.data);
                        setAvailabilities(availabilitiesResponse.data);
                    })
                    .catch(error => {
                        console.error('Error fetching data:', error);
                        setMessage({ type: 'error', text: 'Failed to fetch required data' });
                    })
                    .finally(() => setLoading(false));
            }
        } else if (view === 'employeeAvailabilities') {
            setLoading(true);
            axios.get('http://localhost:3001/all-availabilities')
                .then(response => setAvailabilities(response.data))
                .catch(error => {
                    console.error('Error fetching availabilities:', error);
                    setMessage({ type: 'error', text: 'Failed to fetch availabilities' });
                })
                .finally(() => setLoading(false));
        } else if (view === 'signout') {
            navigate('/login');
        }
    }, [view, navigate]);

    const handleCreateSchedule = async (formData) => {
        try {
            const scheduleData = {
                term: formData.term,
                year: formData.year,
                shiftHours: {
                    monday: { from: formData.shifts.monday.from, to: formData.shifts.monday.to },
                    tuesday: { from: formData.shifts.tuesday.from, to: formData.shifts.tuesday.to },
                    wednesday: { from: formData.shifts.wednesday.from, to: formData.shifts.wednesday.to },
                    thursday: { from: formData.shifts.thursday.from, to: formData.shifts.thursday.to },
                    friday: { from: formData.shifts.friday.from, to: formData.shifts.friday.to },
                    saturday: { from: formData.shifts.saturday.from, to: formData.shifts.saturday.to },
                    sunday: { from: formData.shifts.sunday.from, to: formData.shifts.sunday.to }
                },
                kitchenClasses: formData.kitchenClasses || [],
                itvClasses: formData.itvClasses || [],
                employeeAvailability: []
            };

            const response = await axios.post('http://localhost:3001/schedules', scheduleData);
            setSchedules([...schedules, response.data]);
            setMessage({ type: 'success', text: 'Schedule created successfully' });
            setShowScheduleForm(false);
        } catch (error) {
            console.error('Error creating schedule:', error);
        }
    };

    const handleDeleteSchedule = async (scheduleId) => {
        try {
            if (window.confirm('Are you sure you want to delete this schedule?')) {
                await axios.delete(`http://localhost:3001/schedules/${scheduleId}`);
                setSchedules(prevSchedules => prevSchedules.filter(schedule => schedule._id !== scheduleId));
                setMessage({ type: 'success', text: 'Schedule deleted successfully' });
            }
        } catch (error) {
            console.error('Error deleting schedule:', error);
            setMessage({ type: 'error', text: 'Failed to delete schedule' });
        }
    };

    const handleEditSchedule = (schedule) => {
        setEditingSchedule({ ...schedule, kitchenClasses: [...schedule.kitchenClasses], itvClasses: [...schedule.itvClasses] });
    };

    const handleSaveEdit = async () => {
        try {
            const response = await axios.put(`http://localhost:3001/schedules/${editingSchedule._id}`, {
                ...editingSchedule,
                shiftHours: editingSchedule.shiftHours,
                kitchenClasses: editingSchedule.kitchenClasses,
                itvClasses: editingSchedule.itvClasses,
            });
            setSchedules(schedules.map(s => s._id === editingSchedule._id ? response.data : s));
            setEditingSchedule(null);
            setMessage({ type: 'success', text: 'Schedule updated successfully' });
        } catch (error) {
            console.error('Error updating schedule:', error);
            setMessage({ type: 'error', text: 'Failed to update schedule' });
        }
    };

    const handleClassChange = (type, index, field, value) => {
        const updatedClasses = type === 'kitchen'
            ? [...editingSchedule.kitchenClasses]
            : [...editingSchedule.itvClasses];
        updatedClasses[index] = { ...updatedClasses[index], [field]: value };
        setEditingSchedule({
            ...editingSchedule,
            [type === 'kitchen' ? 'kitchenClasses' : 'itvClasses']: updatedClasses,
        });
    };

    const handleAddClass = (type) => {
        const newClass = { className: '', room: '', day: '', hours: '' };
        const updatedClasses = type === 'kitchen'
            ? [...editingSchedule.kitchenClasses, newClass]
            : [...editingSchedule.itvClasses, newClass];
        setEditingSchedule({
            ...editingSchedule,
            [type === 'kitchen' ? 'kitchenClasses' : 'itvClasses']: updatedClasses,
        });
    };

    const handleDeleteClass = (type, index) => {
        const updatedClasses = type === 'kitchen'
            ? editingSchedule.kitchenClasses.filter((_, i) => i !== index)
            : editingSchedule.itvClasses.filter((_, i) => i !== index);
        setEditingSchedule({
            ...editingSchedule,
            [type === 'kitchen' ? 'kitchenClasses' : 'itvClasses']: updatedClasses,
        });
    };

    const handleDelete = (id) => {
        axios.delete(`http://localhost:3001/employees/${id}`)
            .then(() => {
                setEmployees(prevEmployees => prevEmployees.filter(employee => employee._id !== id));
                setMessage({ type: 'success', text: 'Employee deleted successfully' });
            })
            .catch(error => {
                console.error('Error deleting employee:', error);
                setMessage({ type: 'error', text: 'Failed to delete employee' });
            });
    };

    const toggleEmployee = (employeeId) => {
        setExpandedEmployees(prev => ({
            ...prev,
            [employeeId]: !prev[employeeId]
        }));
    };

    const formatTime = (time) => {
        if (!time) return 'Not Set';
        const [hours, minutes] = time.split(':');
        let hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        hour = hour % 12;
        hour = hour ? hour : 12;
        return `${hour}:${minutes} ${ampm}`;
    };

    const groupedAvailabilities = availabilities.reduce((acc, curr) => {
        const key = `${curr.employeeId}-${curr.employeeName}`;
        if (!acc[key]) {
            acc[key] = [];
        }
        acc[key].push(curr);
        return acc;
    }, {});

    const renderClassFields = (type, klass, index) => {
        const isKitchen = type === 'kitchen';
        return (
            <div key={`${type}-${index}`} className="border p-3 mb-3 rounded position-relative">
                <h6>{isKitchen ? 'Kitchen' : 'ITV'} Class #{index + 1}</h6>
                <div className="row">
                    <div className="col-md-6 mb-2">
                        <label className="form-label">Class Name</label>
                        <input
                            type="text"
                            className="form-control"
                            value={klass.className}
                            onChange={(e) => handleClassChange(type, index, 'className', e.target.value)}
                        />
                    </div>
                    <div className="col-md-6 mb-2">
                        <label className="form-label">Room</label>
                        <input
                            type="text"
                            className="form-control"
                            value={klass.room}
                            onChange={(e) => handleClassChange(type, index, 'room', e.target.value)}
                        />
                    </div>
                    <div className="col-md-6 mb-2">
                        <label className="form-label">Day</label>
                        <select
                            className="form-control"
                            value={klass.day}
                            onChange={(e) => handleClassChange(type, index, 'day', e.target.value)}
                        >
                            <option value="">Select Day</option>
                            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                                <option key={day} value={day}>{day}</option>
                            ))}
                        </select>
                    </div>
                    <div className="col-md-6 mb-2">
                        <label className="form-label">Hours</label>
                        <input
                            type="text"
                            className="form-control"
                            value={klass.hours}
                            onChange={(e) => handleClassChange(type, index, 'hours', e.target.value)}
                            placeholder="e.g. 9:00 AM - 12:00 PM"
                        />
                    </div>
                </div>
                <button
                    className="btn btn-danger position-absolute top-0 end-0 mt-2 me-2"
                    onClick={() => handleDeleteClass(type, index)}
                >
                    Delete
                </button>
            </div>
        );
    };
    


    return (
        <div>
            <Navbar onLinkClick={setView} />
            <div className="container mt-4">
                {message && (
                    <div className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-danger'}`}>
                        {message.text}
                    </div>
                )}

                {view === 'hem' && (
                    <div className="full-screen-image">
                        <img 
                            src="/HC1.jpg" 
                            alt="Hudson Employee Management"
                            className="img-fluid"
                        />
                    </div>
                )}

                {view === 'employees' && (
                    <table className="table table-bordered">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>ID</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {employees.map(employee => (
                                <tr key={employee._id}>
                                    <td>{employee.name}</td>
                                    <td>{employee.email}</td>
                                    <td>{employee.id}</td>
                                    <td>
                                        <button 
                                            className="btn btn-danger" 
                                            onClick={() => {
                                                if (window.confirm('Are you sure you want to delete this employee?')) {
                                                    handleDelete(employee._id);
                                                }
                                            }}
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}

                {view === 'schedule' && (
                    <div>
                        <button 
                            className="btn btn-primary mb-3"
                            onClick={() => setShowScheduleForm(!showScheduleForm)}
                        >
                            Create Schedule
                        </button>

                        {showScheduleForm ? (
                            <ScheduleForm onSubmit={handleCreateSchedule} />
                        ) : (
                            <div className="row">
                                {schedules.map(schedule => (
                                    <div key={schedule._id} className="col-md-4 mb-3">
                                        <div className="card">
                                            <div className="card-body">
                                                <h5 className="card-title">
                                                    {schedule.term} {schedule.year}
                                                </h5>
                                                <div className="mt-3">
                                                    <button 
                                                        className="btn btn-primary me-2"
                                                        onClick={() => handleEditSchedule(schedule)}
                                                    >
                                                        Edit
                                                    </button>
                                                    <button 
                                                        className="btn btn-danger"
                                                        onClick={() => handleDeleteSchedule(schedule._id)}
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Edit Modal */}
                        {editingSchedule && (
                            <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                                <div className="modal-dialog modal-lg">
                                    <div className="modal-content">
                                        <div className="modal-header">
                                            <h5 className="modal-title">Edit Schedule: {editingSchedule.term} {editingSchedule.year}</h5>
                                            <button type="button" className="btn-close" onClick={() => setEditingSchedule(null)}></button>
                                        </div>
                                        <div className="modal-body">
                                            <h6>Kitchen Classes</h6>
                                            {editingSchedule.kitchenClasses.map((klass, index) =>
                                                renderClassFields('kitchen', klass, index)
                                            )}
                                            <button
                                                className="btn btn-success mb-3"
                                                onClick={() => handleAddClass('kitchen')}
                                            >
                                                Add Kitchen Class
                                            </button>

                                            <h6>ITV Classes</h6>
                                            {editingSchedule.itvClasses.map((klass, index) =>
                                                renderClassFields('itv', klass, index)
                                            )}
                                            <button
                                                className="btn btn-success mb-3"
                                                onClick={() => handleAddClass('itv')}
                                            >
                                                Add ITV Class
                                            </button>
                                        </div>
                                        <div className="modal-footer">
                                            <button className="btn btn-secondary" onClick={() => setEditingSchedule(null)}>Cancel</button>
                                            <button className="btn btn-primary" onClick={handleSaveEdit}>Save</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {view === 'employeeAvailabilities' && (
                    <div>
                        <h2 className="mb-4">Employee Availabilities</h2>
                        {loading ? (
                            <div className="text-center">Loading...</div>
                        ) : Object.keys(groupedAvailabilities).length === 0 ? (
                            <div className="alert alert-info">No availabilities submitted yet.</div>
                        ) : (
                            <div className="space-y-2">
                                {Object.entries(groupedAvailabilities).map(([employeeKey, employeeAvailabilities]) => {
                                    const [employeeId, employeeName] = employeeKey.split('-');
                                    return (
                                        <div key={employeeKey} className="border rounded-lg overflow-hidden">
                                            <button
                                                onClick={() => toggleEmployee(employeeId)}
                                                className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 flex justify-between items-center"
                                            >
                                                <span className="font-medium">{employeeName}</span>
                                                {expandedEmployees[employeeId] ? 
                                                    <ChevronUp className="h-5 w-5" /> : 
                                                    <ChevronDown className="h-5 w-5" />
                                                }
                                            </button>

                                            {expandedEmployees[employeeId] && (
                                                <div className="p-4">
                                                    <p className="mb-2"><strong>Employee ID:</strong> {employeeId}</p>

                                                    {employeeAvailabilities.map((avail, index) => (
                                                        <div key={index} className="mb-4 border-t pt-3">
                                                            <h6 className="font-medium mb-2">
                                                                {avail.scheduleTerm} {avail.scheduleYear}
                                                            </h6>
                                                            <table className="w-full">
                                                                <thead className="bg-gray-50">
                                                                    <tr>
                                                                        <th className="px-4 py-2 text-left">Day</th>
                                                                        <th className="px-4 py-2 text-left">From</th>
                                                                        <th className="px-4 py-2 text-left">To</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    {Object.entries(avail.availability).map(([day, times]) => (
                                                                        <tr key={day} className="border-t">
                                                                            <td className="px-4 py-2">
                                                                                {day.charAt(0).toUpperCase() + day.slice(1)}
                                                                            </td>
                                                                            <td className="px-4 py-2">
                                                                                {formatTime(times.from)}
                                                                            </td>
                                                                            <td className="px-4 py-2">
                                                                                {formatTime(times.to)}
                                                                            </td>
                                                                        </tr>
                                                                    ))}
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}



                {view === 'generateSchedule' && (
                    <ScheduleGenerator
                    schedules={schedules}
                    employees={employees}
                    availabilities={availabilities.map(avail => ({
                      ...avail,
                      scheduleYear: avail.scheduleYear ? String(avail.scheduleYear) : avail.scheduleYear
                    }))}
                  />
                )}
                                
            </div>
        </div>
    );
};

export default ManagerDashboard;
