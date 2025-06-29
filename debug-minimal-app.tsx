// Minimal test to isolate the white screen issue
import React from 'react';

const MinimalTest = () => {
  console.log('MinimalTest component rendering...');
  
  return (
    <div style={{ padding: '20px', background: 'lightblue' }}>
      <h1>Minimal Test Component</h1>
      <p>If you can see this, React is working!</p>
      <p>Current time: {new Date().toLocaleString()}</p>
    </div>
  );
};

export default MinimalTest;