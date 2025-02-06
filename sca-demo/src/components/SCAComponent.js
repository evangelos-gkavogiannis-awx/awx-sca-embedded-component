import React, { useEffect, useState, useRef } from 'react';
import { createElement, init } from '@airwallex/components-sdk';

const SCAComponent = ({ userEmail, scaSessionCode, codeVerifier }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const scaElementRef = useRef(null);

  useEffect(() => {
    const initializeSCA = async () => {
      try {
        if (!scaSessionCode) {
          setError("❌ Missing SCA session code from API response");
          console.error("❌ Missing SCA session code from API response");
          return;
        }

        if (!codeVerifier) {
          setError("❌ Missing PKCE codeVerifier");
          console.error("❌ Missing PKCE codeVerifier");
          return;
        }

        console.log("🔹 Initializing SCA with session code:", scaSessionCode);
        console.log("🔹 Using userEmail:", userEmail);
        console.log("🔹 Using PKCE codeVerifier:", codeVerifier);

        // ✅ Initialize Airwallex SDK using the correct SCA session code
        await init({
          authCode: scaSessionCode,  // ✅ Use the extracted session code from API
          codeVerifier: codeVerifier,
          clientId: "-SGVMBpwSdOfMw7Jxgt58g",
          env: process.env.REACT_APP_API_ENV || 'demo',
        });

        scaElementRef.current = await createElement('scaVerify', {
          userEmail: userEmail,
          scaSessionCode: scaSessionCode, // ✅ Use correct session code
        });

        scaElementRef.current.mount('#sca-container');

        scaElementRef.current.on('ready', () => {
          console.log('✅ SCA component is fully ready and mounted!');
          setLoading(false);
        });

        scaElementRef.current.on('verificationSucceed', ({ token }) => {
          console.log('✅ SCA verification succeeded, token:', token);
          localStorage.setItem("scaToken", token);
        });

        scaElementRef.current.on('verificationFailed', ({ reason }) => {
          console.error('❌ SCA verification failed:', reason);
          setError('Verification failed. Please try again.');
        });

        scaElementRef.current.on('error', (e) => {
          console.error('❌ SCA error:', e);
          setError('An error occurred. Please try again.');
        });

      } catch (err) {
        console.error('❌ Failed to initialize SCA component:', err);
        setError(err.message || 'Failed to initialize SCA component');
      }
    };

    initializeSCA();

    return () => {
      if (scaElementRef.current) {
        console.log("🧹 Cleaning up SCA component");
        scaElementRef.current.unmount();
      }
    };
  }, [scaSessionCode, userEmail, codeVerifier]); // ✅ Ensures updated session code is always used

  return (
    <div>
      {loading && <p>Loading SCA Component...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <div id="sca-container" style={{ minHeight: '500px' }} />
    </div>
  );
};

export default SCAComponent;
