import 'dotenv/config';
import express from 'express';
import axios from 'axios';
import cors from 'cors';
import { generateCodeVerifier, generateCodeChallenge } from './authUtils.js';

const app = express();
app.use(cors());
app.use(express.json());

/**
 * ✅ Add Content Security Policy (CSP) Middleware
 * This allows scripts, styles, and API requests from Airwallex
 */
app.use((req, res, next) => {
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; " + 
    "script-src 'self' 'unsafe-inline' https://static-demo.airwallex.com; " + 
    "style-src 'self' 'unsafe-inline'; " + 
    "frame-src 'self' https://static-demo.airwallex.com; " + 
    "connect-src 'self' https://api-demo.airwallex.com https://components-demo.airwallex.com; " + 
    "img-src 'self' data:"
  );
  next();
});



/**
 * ✅ Get Balance History with SCA Token
 */
app.post('/api/balance-history', async (req, res) => {
  try {
    const { scaToken } = req.body;

    if (!scaToken) {
      return res.status(400).json({ message: "SCA token is required to retrieve balance history." });
    }

    console.log(`Using API Key: ${process.env.AIRWALLEX_API_KEY}`);
    console.log(`Using SCA Token: ${scaToken}`);

    const response = await axios.get('https://api-demo.airwallex.com/api/v1/balances/history', {
      headers: {
        Authorization: `Bearer ${process.env.AIRWALLEX_API_KEY}`,
        'x-on-behalf-of': 'acct_VB8qmnkJNnaZKTpGPjLwsQ',
        'x-sca-token': scaToken, // ✅ Include SCA token
      },
    });

    // ✅ Extract the correct SCA session code from response headers
    const scaSessionCode = response.headers['x-sca-session-code'];

    if (scaSessionCode) {
      console.log(`📌 SCA Required: Returning X-Sca-Session-Code: ${scaSessionCode}`);
      return res.status(401).json({
        message: "SCA required",
        scaSessionCode, // ✅ Return the correct session code
      });
    }

    res.json(response.data);
  } catch (error) {
    console.error('Balance history error:', error.response ? error.response.data : error.message);

    if (error.response && error.response.headers['x-sca-session-code']) {
      return res.status(401).json({
        message: "SCA required",
        scaSessionCode: error.response.headers['x-sca-session-code'], // ✅ Return the correct session code if needed
      });
    }

    res.status(500).json({ message: 'Failed to retrieve balance history' });
  }
});


/**
 * ✅ Get Authorization Code for SCA
 */
app.post('/api/get-auth-code', async (req, res) => {
  const { accountId, identity } = req.body;

  if (!accountId || !identity) {
    return res.status(400).json({ error: "Account ID and Identity are required" });
  }

  console.log(`Requesting SCA for Account: ${accountId}, Identity: ${identity}`);

  const codeVerifier = generateCodeVerifier();
  const codeChallenge = await generateCodeChallenge(codeVerifier);

  try {
    const response = await axios.post(
      'https://api-demo.airwallex.com/api/v1/authentication/authorize',
      {
        scope: ['w:awx_action:sca_edit', 'r:awx_action:sca_view'],
        code_challenge: codeChallenge,
        code_challenge_method: 'S256',
        identity: accountId,  // ✅ Corrected this field (was incorrectly set to `accountId` before)
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.AIRWALLEX_API_KEY}`,
          'x-on-behalf-of': accountId,
        },
      }
    );

    console.log('Received Authorization Code:', response.data.authorization_code);

    res.json({
      authorization_code: response.data.authorization_code,
      codeVerifier,
    });
  } catch (error) {
    console.error('Error getting authorization code:', error.response ? error.response.data : error.message);
    res.status(500).json({ message: 'Failed to get authorization code' });
  }
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
