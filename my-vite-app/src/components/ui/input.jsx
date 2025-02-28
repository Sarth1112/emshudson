import React from "react";
import PropTypes from "prop-types";

const Input = ({ type = "text", value, onChange, className, ...props }) => (
  <input
    type={type}
    value={value}
    onChange={onChange}
    className={`border rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
    {...props}
  />
);

Input.propTypes = {
  type: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func.isRequired,
  className: PropTypes.string,
};

export default Input; // ✅ Ensure this line is present
