import React from 'react'
import NavbarEmployee from './components/NavbarEmployee';
import { useState } from 'react';
import { useEffect } from 'react';
import AvailabilityForm from './components/AvailabilityForm';
import axios from 'axios';
const employeeDashboard = () => {
  const [schedules, setSchedules] = useState([]);
  const [showAvailabilityForm, setShowAvailabilityForm] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [view, setView] = useState('hem');

  const employeeId = localStorage.getItem('employeeId');

   useEffect(() => {
      
    axios.get('http://localhost:3001/schedules')
      .then(response => setSchedules(response.data))
      .catch(error => console.error('Error:', error));
  }, []);

   
  return (
    <div> 
      <NavbarEmployee onLinkClick={setView} />
      <div className="container mt-4">
                
                {view === 'hem' && (
                    <div className="full-screen-image">
                        <img 
                            src="/HC1.jpg" // Make sure this path is correct
                            alt="Hudson Employee Management"
                            className="img-fluid"
                        />
                    </div>
                )}

                {view === 'availability' && (
                    <div className="container mt-4">
                    <div className="row">
                      {schedules.map((schedule) => (
                        <div key={schedule._id} className="col-md-4 mb-3">
                          <div 
                            className="card" 
                            onClick={() => {
                              setSelectedSchedule(schedule);
                              setShowAvailabilityForm(true);
                            }}
                          >
                            <div className="card-body">
                              <h5 className="card-title">{schedule.term} {schedule.year}</h5>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
              
                    {showAvailabilityForm && selectedSchedule && (
                      <AvailabilityForm 
                        schedule={selectedSchedule}
                        employeeId={employeeId}
                        onClose={() => setShowAvailabilityForm(false)}
                      />
                    )}
                  </div>
                )}

                {view === 'myschedule' && (
                    <div>
                      My Schedule
                    </div>
                )}
                </div>
      </div>
  )
}

export default employeeDashboard