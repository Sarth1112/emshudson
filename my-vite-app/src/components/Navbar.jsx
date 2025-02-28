import React, { useState } from 'react';
import PropTypes from 'prop-types';
import './Navbar.css';

const Navbar = ({ onLinkClick }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleLinkClick = (view) => {
    onLinkClick(view);
    setIsOpen(false);
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light">
      <div className="container-fluid">
        <a
          className="navbar-brand"
          href="#"
          onClick={(e) => {
            e.preventDefault();
            handleLinkClick('hem');
          }}
        >
          Hudson Employee Management
        </a>
        <button
          className="navbar-toggler"
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          aria-controls="navbarNav"
          aria-expanded={isOpen}
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className={`collapse navbar-collapse ${isOpen ? 'show' : ''}`} id="navbarNav">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <a
                className="nav-link"
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  handleLinkClick('employees');
                }}
              >
                Employees
              </a>
            </li>
            <li className="nav-item">
              <a
                className="nav-link"
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  handleLinkClick('schedule');
                }}
              >
                Schedule Building
              </a>
            </li>
            <li className="nav-item">
              <a
                className="nav-link"
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  handleLinkClick('employeeAvailabilities');
                }}
              >
                Employee Availabilities
              </a>
            </li>
            <li className="nav-item">
                <a
                  className="nav-link"
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    handleLinkClick('generateSchedule');
                  }}
                >
                  Generate Schedule
                </a>
              </li>


          </ul>
          <ul className="navbar-nav">
            <li className="nav-item">
              <a
                className="nav-link text-danger"
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  handleLinkClick('signout');
                }}
              >
                Sign Out
              </a>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

Navbar.propTypes = {
  onLinkClick: PropTypes.func.isRequired,
};

export default Navbar;