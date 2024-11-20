import 'dotenv/config';
import express from 'express';
import axios from 'axios';
import cors from 'cors';
import { generateCodeVerifier, generateCodeChallenge } from './authUtils.js';

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/balance-history', async (req, res) => {
    try {
      console.log(`Using API Key: ${process.env.AIRWALLEX_API_KEY}`);
      
      const response = await axios.get('https://api-demo.airwallex.com/api/v1/balances/history', {
        headers: {
          Authorization: `Bearer ${process.env.AIRWALLEX_API_KEY}`,
          'x-on-behalf-of': 'acct_VB8qmnkJNnaZKTpGPjLwsQ',
        },
      });
  
      res.json(response.data);
    } catch (error) {
      console.error('Error:', error.response ? error.response.data : error.message);
      if (error.response && error.response.data.code === 'sca_token_missing') {
        res.status(401).json({ message: "This request requires Strong Customer Authentication (SCA). Please specify a valid `x-sca-token` in the request header." });
      } else {
        res.status(500).json({ message: 'Failed to retrieve balance history' });
      }
    }
  });
  

app.post('/api/get-auth-code', async (req, res) => {
  const { accountId, identity } = req.body;
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = await generateCodeChallenge(codeVerifier);

  try {
    const response = await axios.post(
      'https://api-demo.airwallex.com/api/v1/authentication/authorize',
      {
        scope: ['w:awx_action:sca_edit', 'r:awx_action:sca_view'],
        code_challenge: codeChallenge,
        code_challenge_method: 'S256',
        identity,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.AIRWALLEX_API_KEY}`,
          'x-on-behalf-of': accountId,
        },
      }
    );

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
