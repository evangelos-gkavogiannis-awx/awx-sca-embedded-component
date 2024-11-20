import crypto from 'crypto';
import { Base64 } from 'js-base64';

export const generateCodeVerifier = () => {
  return crypto.randomBytes(32).toString('hex');
};

export const generateCodeChallenge = async (codeVerifier) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(codeVerifier);
  const hashed = await crypto.subtle.digest('SHA-256', data);
  const base64encoded = Base64.fromUint8Array(new Uint8Array(hashed), true);
  return base64encoded;
};
