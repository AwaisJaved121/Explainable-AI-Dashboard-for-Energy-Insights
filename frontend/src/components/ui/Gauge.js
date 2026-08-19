import React from 'react';
import './Gauge.css';

const Gauge = ({ 
  value, 
  label, 
  min = 0, 
  max = 100, 
  showValue = true
}) => {
  const percentage = ((value - min) / (max - min)) * 100;
  const constrainedPercentage = Math.max(0, Math.min(100, percentage));
  
  return (
    <div className="gauge-container">
      <div className="gauge-label">{label}</div>
      <div className="gauge-track">
        <div 
          className="gauge-fill" 
          style={{ width: `${constrainedPercentage}%` }}
        />
      </div>
      {showValue && (
        <div className="gauge-value">
          {value.toFixed(1)}{' '}
          <span className="gauge-unit">units</span>
        </div>
      )}
    </div>
  );
};

export default Gauge;