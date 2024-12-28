import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import ScheduleForm from './components/ScheduleForm';

const ManagerDashboard = () => {
    const [view, setView] = useState('hem');
    const [employees, setEmployees] = useState([]);
    const [message, setMessage] = useState(null);
    const [showScheduleForm, setShowScheduleForm] = useState(false);
    const [schedules, setSchedules] = useState([]);
    const navigate = useNavigate();

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
            employeeAvailability: []
          };
      
          const response = await axios.post('http://localhost:3001/schedules', scheduleData);
          setSchedules([...schedules, response.data]);
          setShowScheduleForm(false);
        } catch (error) {
          console.error('Error creating schedule:', error);
        }
      };
  

    useEffect(() => {
        if (view === 'employees') {
            axios.get('http://localhost:3001/employees')
                .then(response => setEmployees(response.data))
                .catch(error => {
                    console.error('Error fetching employees:', error);
                    setMessage({ type: 'error', text: 'Failed to fetch employees' });
                });
        } else if (view === 'signout') {
            navigate('/login'); // Redirect to login page on signout
        }
    }, [view, navigate]);

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
                            src="/HC1.jpg" // Make sure this path is correct
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
                                                if(window.confirm('Are you sure you want to delete this employee?')) {
                                                    handleDelete(employee._id)
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
                    <div className="container mt-4">
                    <button 
                        className="btn btn-primary mb-3"
                        onClick={() => setShowScheduleForm(true)}
                    >
                        Create Schedule
                    </button>
                    
                    {showScheduleForm && (
                        <ScheduleForm onSubmit={handleCreateSchedule} onClose={() => setShowScheduleForm(false)} />
                    )}

                    <div className="row">
                        {schedules.map((schedule) => (
                        <div key={schedule._id} className="col-md-4 mb-3">
                            <div className="card">
                            <div className="card-body">
                                <h5 className="card-title">{schedule.term}{schedule.year}</h5>
                            </div>
                            </div>
                        </div>
                        ))}
                    </div>
                    </div>
                )}
                </div>
        </div>
    );
};

export default ManagerDashboard;