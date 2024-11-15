import { useState } from 'react'
import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './Login';
import SignupForm from './SignupForm';
import ManagerDashboard from './managerDashboard';
import EmployeeDashboard from './employeeDashboard';
import ResetPass from './ResetPass';
function App() {

  return (
    <>
      <div>
        <BrowserRouter>
          <Routes>
            <Route path="/register" element={<SignupForm/>}></Route>
            <Route path="/login" element={<Login/>}></Route>
            <Route path="/manager-dashboard" element={<ManagerDashboard/>}></Route>
            <Route path="/employee-dashboard" element={<EmployeeDashboard/>}></Route>
            <Route path="/reset-password" element={<ResetPass/>}></Route>
          </Routes>  

        </BrowserRouter>
      </div>
    </>
  )
}

export default App
