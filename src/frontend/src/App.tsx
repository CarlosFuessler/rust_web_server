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
  const [apiResponse, setApiResponse] = useState<string>('');
  const [jsonResponse, setJsonResponse] = useState<ResponseData | null>(null);

  useEffect(() => {
    // Test API Call
    fetch('/api')
      .then(response => response.text())
      .then(data => {
        console.log(data);
        setApiResponse(data);
      })
      .catch(error => console.error('Error:', error));
  }, []);

  const handleJsonTest = async () => {
    const testData: InputData = { name: "TypeScript User", age: 25 };
    
    try {
      const response = await fetch('/api/json', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testData),
      });
      
      const data: ResponseData = await response.json();
      setJsonResponse(data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <h1>React TypeScript + Rust Webserver</h1>
        
        <div style={{ margin: '20px' }}>
          <h3>API Response:</h3>
          <p>{apiResponse}</p>
        </div>

        <button onClick={handleJsonTest} style={{ 
          padding: '10px 20px', 
          fontSize: '16px',
          backgroundColor: '#61dafb',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer'
        }}>
          Test JSON API
        </button>

        {jsonResponse && (
          <div style={{ margin: '20px' }}>
            <h3>JSON Response:</h3>
            <p>{jsonResponse.message}</p>
          </div>
        )}

        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React with TypeScript
        </a>
      </header>
    </div>
  );
}

export default App;