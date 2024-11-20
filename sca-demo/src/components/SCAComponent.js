import React, { useEffect, useState } from 'react';
import { createElement, init } from '@airwallex/components-sdk';

const SCAComponent = ({ userEmail, scaSessionCode, codeVerifier }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let scaElement;

    const initializeSCA = async () => {
      try {
        // Initialize the SDK
        await init({
          authCode: scaSessionCode,
          codeVerifier: codeVerifier,
          clientId: "-SGVMBpwSdOfMw7Jxgt58g",
          env: process.env.REACT_APP_API_ENV || 'demo',
        });

        scaElement = await createElement('scaVerify', {
          userEmail: userEmail,
          scaSessionCode: scaSessionCode,
        });

        // Mount the SCA element
        scaElement.mount('#sca-container');

        // Add event listeners
        scaElement.on('ready', () => {
          console.log('SCA component is ready');
          setLoading(false);
        });

        scaElement.on('verificationSucceed', ({ token }) => {
          console.log('SCA succeeded, token:', token);
        });

        scaElement.on('verificationFailed', ({ reason }) => {
          console.error('SCA verification failed:', reason);
          setError('Verification failed. Please try again.');
        });

        scaElement.on('error', (e) => {
          console.error('SCA error:', e);
          setError('An error occurred. Please try again.');
        });

      } catch (err) {
        console.error('Failed to initialize SCA component:', err);
        setError(err.message || 'Failed to initialize SCA component');
      }
    };

    initializeSCA();

    // Cleanup function to unmount the component
    return () => {
      if (scaElement) {
        scaElement.unmount();
      }
    };
  }, [scaSessionCode, userEmail, codeVerifier]); // Only run once when these values change

  return (
    <div>
      {loading ? <p>Loading SCA Component...</p> : null}
      {error ? <p style={{ color: 'red' }}>{error}</p> : null}
      <div id="sca-container" style={{ minHeight: '500px' }} /> {/* Ensure this container is always rendered */}
    </div>
  );
};

export default SCAComponent;