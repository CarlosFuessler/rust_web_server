import React, { useEffect, useState } from 'react';
import logo from './logo.svg';
import './App.css';

// TypeScript Interfaces für API Daten
interface ResponseData {
  message: string;
}

interface InputData {
  name: string;
  age: number;
}

function App() {
  // useEffect muss INNERHALB der Komponente stehen
  useEffect(() => {
    // Register custom protocol handler
    if ('registerProtocolHandler' in navigator) {
      try {
        navigator.registerProtocolHandler(
          'carlos',
          'http://127.0.0.1:3020/carlos?url=%s',
          // Removed the third argument as it is not supported
        );
        console.log('Carlos protocol handler registered!');
      } catch (error) {
        console.log('Protocol handler registration failed:', error);
      }
    }
  }, []);

  return (
    <div>Hello World</div>
  );
}

export default App;