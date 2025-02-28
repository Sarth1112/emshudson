import React, { useState, useEffect } from 'react';
import NavbarEmployee from './components/NavbarEmployee';
import AvailabilityForm from './components/AvailabilityForm';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const EmployeeDashboard = () => {
  const [schedules, setSchedules] = useState([]);
  const [showAvailabilityForm, setShowAvailabilityForm] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [view, setView] = useState('hem');
  const [availabilities, setAvailabilities] = useState({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const employeeId = localStorage.getItem('employeeId');

  if (view === 'signout') {
    navigate('/login');
}
  useEffect(() => {
    
    const fetchData = async () => {
      try {
        // Fetch schedules
        const schedulesResponse = await axios.get('http://localhost:3001/schedules');
        setSchedules(schedulesResponse.data);
        
        // Fetch availabilities for each schedule
        const availabilityPromises = schedulesResponse.data.map(schedule =>
          axios.get(`http://localhost:3001/availability/${schedule._id}/${employeeId}`)
        );
        
        const availabilityResponses = await Promise.all(availabilityPromises);
        const availabilityMap = {};
        availabilityResponses.forEach((response, index) => {
          if (response.data) {
            availabilityMap[schedulesResponse.data[index]._id] = response.data;
          }
        });
        
        setAvailabilities(availabilityMap);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (view === 'availability') {
      fetchData();
    } 
  }, [view, employeeId]);

  const handleFormClose = () => {
    setShowAvailabilityForm(false);
    setSelectedSchedule(null);
    // Refresh availabilities after form close
    if (view === 'availability') {
      setLoading(true);
      axios.get(`http://localhost:3001/availability/${selectedSchedule._id}/${employeeId}`)
        .then(response => {
          setAvailabilities(prev => ({
            ...prev,
            [selectedSchedule._id]: response.data
          }));
        })
        .finally(() => setLoading(false));
    }
  };

  return (
    <div>
      <NavbarEmployee onLinkClick={setView} />
      <div className="container mt-4">
        {view === 'hem' && (
          <div className="full-screen-image">
            <img
              src="/HC1.jpg"
              alt="Hudson Employee Management"
              className="img-fluid"
            />
          </div>
        )}

        {view === 'availability' && (
          <div className="container mt-4">
            {loading ? (
              <div className="text-center">Loading...</div>
            ) : (
              <div className="row">
                {schedules.map((schedule) => (
                  <div key={schedule._id} className="col-md-4 mb-3">
                    <div
                      className="card"
                      onClick={() => {
                        setSelectedSchedule(schedule);
                        setShowAvailabilityForm(true);
                      }}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="card-body">
                        <h5 className="card-title">{schedule.term} {schedule.year}</h5>
                        <div className="mt-2">
                          {availabilities[schedule._id] ? (
                            <span className="badge bg-success">Submitted</span>
                          ) : (
                            <span className="badge bg-warning">Not Submitted</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {showAvailabilityForm && selectedSchedule && (
              <div className="mt-4">
                <AvailabilityForm
                  schedule={selectedSchedule}
                  employeeId={employeeId}
                  existingAvailability={availabilities[selectedSchedule._id]}
                  onClose={handleFormClose}
                />
              </div>
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
  );
};

export default EmployeeDashboard;



