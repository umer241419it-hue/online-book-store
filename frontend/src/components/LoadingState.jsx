import React from 'react';

const LoadingState = ({ message = 'Loading books...' }) => {
  return (
    <div className="loading-state-container" id="loading-state-indicator">
      <div className="loading-spinner-ring"></div>
      <p className="loading-message-text">{message}</p>
    </div>
  );
};

export default LoadingState;
