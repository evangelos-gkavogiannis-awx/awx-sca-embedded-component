import React, { useEffect, useState } from 'react';
import SCAComponent from '../src/components/SCAComponent';

const App = () => {
  const [scaSessionCode, setScaSessionCode] = useState(null);
  const [codeVerifier, setCodeVerifier] = useState(null);
  const [error, setError] = useState(null);
  const [balanceHistory, setBalanceHistory] = useState(null);

  useEffect(() => {
    const fetchScaSessionCode = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/get-auth-code', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ accountId: 'acct_VB8qmnkJNnaZKTpGPjLwsQ', identity: 'acct_VB8qmnkJNnaZKTpGPjLwsQ' }),
        });

        const data = await response.json();
        setScaSessionCode(data.authorization_code);
        setCodeVerifier(data.codeVerifier);
      } catch (error) {
        console.error('Error fetching SCA session code:', error);
        setError('Failed to retrieve SCA session code.');
      }
    };

    fetchScaSessionCode();
  }, []);

  const fetchBalanceHistory = async () => {
    const scaToken = localStorage.getItem("scaToken");
  
    if (!scaToken) {
      alert("SCA verification is required.");
      return;
    }
  
    try {
      const response = await fetch('http://localhost:5000/api/balance-history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scaToken }),
      });
  
      const data = await response.json();
  
      // ✅ If SCA is required, update the session code and trigger SCA verification
      if (response.status === 401 && data.scaSessionCode) {
        console.log("🔹 Received X-Sca-Session-Code from backend:", data.scaSessionCode);
        setScaSessionCode(data.scaSessionCode);
        return;
      }
  
      setBalanceHistory(data);
    } catch (error) {
      console.error('Error fetching balance history:', error);
      setError('Failed to retrieve balance history.');
    }
  };
  

  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div style={{ textAlign: 'center', fontFamily: 'Arial, sans-serif', padding: '20px' }}>
      <img
        src="https://images.ctfassets.net/sxag7u4cz1re/4JT4j5mM4qMIBdchA0NtuV/6182b7df2437b3b75b7b6a6d9de18d73/Airwallex_Logo_-_Black.png"
        alt="Airwallex Logo"
        style={{ width: '200px', marginBottom: '20px' }}
      />
      <h1>Retrieve Balance with SCA</h1>
      <p>Here you can retrieve your balance history.</p>

      {scaSessionCode && codeVerifier ? (
        <SCAComponent userEmail="user@example.com" scaSessionCode={scaSessionCode} codeVerifier={codeVerifier} />
      ) : (
        <p>Loading SCA Component...</p>
      )}

      <button onClick={fetchBalanceHistory} style={{ marginTop: '20px', padding: '10px 20px', fontSize: '16px' }}>
        Fetch Balance History
      </button>

      {balanceHistory && (
        <div style={{ marginTop: '20px', textAlign: 'left' }}>
          <h2>Balance History</h2>
          <pre>{JSON.stringify(balanceHistory, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default App;
