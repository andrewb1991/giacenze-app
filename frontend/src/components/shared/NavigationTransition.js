// components/shared/NavigationTransition.js
import React from 'react';

const NavigationTransition = ({ children, className = '' }) => {
  return (
    <div className={`page-container ${className}`}>
      {children}
      
      <style jsx>{`
        .page-container {
          width: 100%;
          min-height: 100vh;
        }
      `}</style>
    </div>
  );
};

export default NavigationTransition;