import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ManagerDashboard = () => {
    const [view, setView] = useState('hem');
    const [employees, setEmployees] = useState([]);
    const [scheduleName, setScheduleName] = useState('');
    const [message, setMessage] = useState(null);
    const navigate = useNavigate();

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
                    <form>
                        <div className="form-group">
                            <label htmlFor="scheduleName">Enter Schedule Name:</label>
                            <input
                                type="text"
                                id="scheduleName"
                                className="form-control"
                                value={scheduleName}
                                onChange={e => setScheduleName(e.target.value)}
                            />
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default ManagerDashboard;