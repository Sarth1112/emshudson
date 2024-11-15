import React from 'react';
import PropTypes from 'prop-types';
import './Navbar.css';
const Navbar = ({ onLinkClick }) => {
  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light px-4">
      <a className="navbar-brand" href="#" onClick={() => onLinkClick('hem')}>
        Hudson Employee Management
      </a>
      <button
        className="navbar-toggler"
        type="button"
        data-toggle="collapse"
        data-target="#navbarNav"
        aria-controls="navbarNav"
        aria-expanded="false"
        aria-label="Toggle navigation"
      >
        
      </button>
      <div className="collapse navbar-collapse" id="navbarNav">
        <ul className="navbar-nav mr-auto">
          <li className="nav-item">
            <a className="nav-link" href="#" onClick={() => onLinkClick('employees')}>
              Employees
            </a>
          </li>
          <li className="nav-item">
            <a className="nav-link" href="#" onClick={() => onLinkClick('schedule')}>
              Schedule Building
            </a>
          </li>
        </ul>
        <div className="navbar-nav ml-auto">
            <a className="nav-link text-danger signout-link" href="#" onClick={() => onLinkClick('signout')}>
                 Sign Out
            </a>
        </div>

       
      </div>
    </nav>
  );
};

// PropTypes validation
Navbar.propTypes = {
  onLinkClick: PropTypes.func.isRequired,
};

export default Navbar;
