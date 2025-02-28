import React from "react";
import PropTypes from "prop-types";

const Alert = ({ variant = "default", children }) => {
  const baseClass = "p-3 rounded-md";
  const variants = {
    default: "bg-gray-200 text-gray-800",
    destructive: "bg-red-500 text-white",
  };

  return <div className={`${baseClass} ${variants[variant]}`}>{children}</div>;
};

Alert.propTypes = {
  variant: PropTypes.oneOf(["default", "destructive"]),
  children: PropTypes.node.isRequired,
};

export default Alert;
