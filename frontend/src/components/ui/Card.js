import React from 'react';
import './Card.css';

const Card = ({ className = '', children, ...props }) => {
  return (
    <div
      className={`card bg-card/80 backdrop-blur-sm border border-border/50 rounded-xl ${className}`}
      {...props}
    >
      <div className="p-6">{children}</div>
    </div>
  );
};

export default Card;