import React, { useState } from 'react'
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

const SignupForm = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [id, setId] = useState('');
  const [error, setError] = useState('');
  //const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();

        const userData = {
            name, 
            email, 
            password, 
            dateOfBirth, 
            id 
        };

        axios.post('http://localhost:3001/register', userData)
            
        
        .then(result => {
                console.log(result);
                setError('');
                
            })
            .catch(err => {
                if(err.response) {
                    setError(err.response.data.error);
                } else{
                    setError('An unexpected error occurred. Please try again.');

                }

            });
    };


  return (
    <div className="background-image d-flex justify-content-center align-items-center vh-100">
    <div className="signup-form-container bg-white p-3 rounded w-25">
        <h2>Register</h2>

        {error && (
            <div className='alert alert-danger' role="alert">
                {error}
            </div>
        )}
        <form onSubmit={handleSubmit}> 
            <div className="mb-3">
                <label htmlFor="name"><strong>Name</strong></label>
                <input
                    type="text"
                    placeholder="Enter Name"
                    autoComplete="off"
                    id="name"
                    name="name"
                    className="form-control rounded-0"
                    onChange={(e) => setName(e.target.value)}
                />
            </div>
            <div className="mb-3">
                <label htmlFor="email"><strong>Email</strong></label>
                <input
                    type="email"
                    placeholder="Enter Email"
                    autoComplete="off"
                    id="email"
                    name="email"
                    className="form-control rounded-0"
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
                    onChange={(e) => setPassword(e.target.value)}
                />
            </div>
              
            <div className="mb-3">
                <label htmlFor="dateOfBirth"><strong>Date of Birth</strong></label>
                <input
                    type="date"
                    id="dateOfBirth"
                    name="dateOfBirth"
                    className="form-control rounded-0"
                    onChange={(e) => setDateOfBirth(e.target.value)}
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
                    onChange={(e) => setId(e.target.value)}
                />
            </div>
            
            <button type="submit" className="btn btn-primary w-100 rounded-0">Sign Up</button>
        </form>
        <p>Already Have an Account? <Link to="/login" className="text-decoration-none">Log in</Link></p>        
    </div>
</div>
  )
}

export default SignupForm
