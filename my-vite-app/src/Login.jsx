import React from 'react'
import axios from 'axios';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
const Login = () => {

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        const userData = { email, password };
        axios.post('http://localhost:3001/login', userData)
            .then((response) => {
                if(response.data.role === 'admin') {
                    navigate('/manager-dashboard');
                }else if(response.data.role === 'employee') {
                    navigate('/employee-dashboard');
                }
            })

            .catch((err) => {
                setError('Invalid email or password');
                console.error(err);
            });

    };

  return (
    <div className="background-image d-flex justify-content-center align-items-center vh-100">
    <div className="bg-white p-3 rounded w-25">
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
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
          <label htmlFor="password"><strong>Password</strong></label>
          <input
            type="password"
            placeholder="Enter Password"
            id="password"
            name="password"
            className="form-control rounded-0"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        {error && <p className="text-danger">{error}</p>}
        <button type="submit" className="btn btn-primary w-100 rounded-0">Login</button>
        <p>Don't have an account? <Link to="/register" className="text-decoration-none">Sign up</Link></p>
        <p>Forgot your password? <Link to="/reset-password" className="text-decoration-none">Reset Password</Link></p>
      </form>
      
      
    </div>
  </div>
  )
}

export default Login
