import React, { useEffect, useState } from 'react';
import SCAComponent from '../src/components/SCAComponent';

const App = () => {
  const [scaSessionCode, setScaSessionCode] = useState(null);
  const [codeVerifier, setCodeVerifier] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchScaSessionCode = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/get-auth-code', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ accountId: 'acct_VB8qmnkJNnaZKTpGPjLwsQ', identity: 'user_123' }), // Update with actual values
        });

        const data = await response.json();
        setScaSessionCode(data.authorization_code);
        setCodeVerifier(data.codeVerifier); // Save codeVerifier for SCA initialization
      } catch (error) {
        console.error('Error fetching SCA session code:', error);
        setError('Failed to retrieve SCA session code.');
      }
    };

    fetchScaSessionCode();
  }, []);

  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div style={{ textAlign: 'center', fontFamily: 'Arial, sans-serif', padding: '20px' }}>
      <img
        src="https://workmotion.com/wp-content/uploads/2023/01/workmotion-logo.svg"
        alt="WorkMotion Logo"
        style={{ width: '200px', marginBottom: '20px' }}
      />
      <h1>Retrieve Balance with SCA</h1>
      <p>Here you can retrieve your balance history.</p>
      {scaSessionCode && codeVerifier ? (
        <SCAComponent userEmail="user@example.com" scaSessionCode={scaSessionCode} codeVerifier={codeVerifier} />
      ) : (
        <p>Loading SCA Component...</p>
      )}
    </div>
  );
};

export default App;
