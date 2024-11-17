// src/components/Subscription.js
import React from 'react';
import Header from './Header'; // Assuming Header contains common navigation links

const Subscription = () => {
  return (
    <div className="coming-soon-container">
      <Header />
      <div className="coming-soon-content">
        <h2>Subscription</h2>
        <p>Coming Soon...</p>
      </div>
    </div>
  );
};

export default Subscription;
