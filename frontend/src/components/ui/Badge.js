import React from 'react';
import './Badge.css';

const Badge = ({ 
  children, 
  variant = 'secondary',
  className = ''
}) => {
  return (
    <span className={`badge badge-${variant} ${className}`}>
      {children}
    </span>
  );
};

Badge.defaultProps = {
  variant: 'secondary'
};

export default Badge;