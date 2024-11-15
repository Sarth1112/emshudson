import React, { useState } from 'react'
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ResetPass = () => {

    const [email, setEmail] = useState('');
    const [id, setId] = useState('');
    const [dateOfBirth, setDateOfBirth] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [resetStep, setResetStep] = useState(1); // Track reset steps
    const [message, setMessage] = useState('');
    const navigate = useNavigate(); 

    const handleSubmit = (e) => {
        e.preventDefault();
        if (resetStep === 1) {
            const isoDateOfBirth = new Date(dateOfBirth).toISOString();
            axios.post('http://localhost:3001/reset-password', { email, id, dateOfBirth: isoDateOfBirth })
                .then(() => {
                    setMessage('Verification successful. Proceed to set new password.');
                    setResetStep(2);
                })
                .catch((error) => {
                    console.error("Verification Error:", error); // Log error to console
                    setMessage('Verification failed. Please check your credentials.');
                });
        } else if (resetStep === 2) {
            if (newPassword !== confirmPassword) {
                setMessage('Passwords do not match.');
                return;
            }
            axios.post('http://localhost:3001/set-new-password', { email, newPassword })
                .then(() => {
                    setMessage('Password reset successfully.');
                    navigate('/login');
                })
                .catch((error) => {
                    console.error("Password Reset Error:", error); // Log error to console
                    setMessage('Error resetting password. Please try again.');
                });
        }
    };
    



  return (
    <div className="background-image d-flex justify-content-center align-items-center vh-100"> {/* Apply the same background class */}
    <div className="bg-white p-3 rounded w-25">
      <h2>Reset Password</h2>
      <form onSubmit={handleSubmit}>
        {resetStep === 1 && (
          <>
            <div className="mb-3">
              <label htmlFor="email"><strong>Email</strong></label>
              <input
                type="email"
                placeholder="Enter Email"
                autoComplete="off"
                id="email"
                name="email"
                className="form-control rounded-0"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="mb-3">
              <label htmlFor="id"><strong>ID</strong></label>
              <input
                type="text"
                placeholder="Enter ID"
                autoComplete="off"
                id="id"
                name="id"
                className="form-control rounded-0"
                value={id}
                onChange={(e) => setId(e.target.value)}
              />
            </div>
            <div className="mb-3">
              <label htmlFor="dateOfBirth"><strong>Date of Birth</strong></label>
              <input
                type="date"
                id="dateOfBirth"
                name="dateOfBirth"
                className="form-control rounded-0"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
              />
            </div>
          </>
        )}
        {resetStep === 2 && (
          <>
            <div className="mb-3">
              <label htmlFor="newPassword"><strong>New Password</strong></label>
              <input
                type="password"
                placeholder="Enter New Password"
                id="newPassword"
                name="newPassword"
                className="form-control rounded-0"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <div className="mb-3">
              <label htmlFor="confirmPassword"><strong>Confirm Password</strong></label>
              <input
                type="password"
                placeholder="Confirm New Password"
                id="confirmPassword"
                name="confirmPassword"
                className="form-control rounded-0"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </>
        )}
        <button type="submit" className="btn btn-primary w-100 rounded-0">Reset Password</button>
      </form>
      <p>{message}</p>
    </div>
  </div>
  )
}

export default ResetPass