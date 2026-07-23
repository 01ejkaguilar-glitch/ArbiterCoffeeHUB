import React from 'react';
import './HoverEffect.css';

export const HoverEffect = ({ children, className = '', ...props }) => {
  const [isHovered, setIsHovered] = React.useState(false);

  return (
    <div
      className={`${className} ${isHovered ? 'hover-effect' : ''}`}
      onMouseEnterCapture={() => setIsHovered(true)}
      onMouseLeaveCapture={() => setIsHovered(false)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      {...props}
    >
      {children}
    </div>
  );
};