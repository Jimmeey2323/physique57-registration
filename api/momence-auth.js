// Vercel Serverless Function – Momence authentication proxy
// Returns a Momence session token without exposing credentials to the browser
// Secrets read from Vercel Environment Variables

const fetch = require('node-fetch');

const MOMENCE_BASIC_AUTH  = process.env.MOMENCE_BASIC_AUTH;   // "Basic xxxx"
const MOMENCE_USERNAME    = process.env.MOMENCE_USERNAME;
const MOMENCE_PASSWORD    = process.env.MOMENCE_PASSWORD;

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept');

  if (req.method === 'OPTIONS') { res.status(200).end(); return; }
  if (req.method !== 'POST')    { return res.status(405).json({ error: 'Method not allowed' }); }

  try {
    const { grantType, refreshToken } = req.body || {};

    let bodyParams;
    if (grantType === 'refresh_token' && refreshToken) {
      bodyParams = new URLSearchParams({
        grant_type:    'refresh_token',
        refresh_token: refreshToken,
      });
    } else {
      // Default: password grant
      bodyParams = new URLSearchParams({
        grant_type: 'password',
        username:   MOMENCE_USERNAME,
        password:   MOMENCE_PASSWORD,
      });
    }

    const authRes = await fetch('https://api.momence.com/api/v2/auth/token', {
      method: 'POST',
      headers: {
        accept:         'application/json',
        authorization:  MOMENCE_BASIC_AUTH,
        'content-type': 'application/x-www-form-urlencoded',
      },
      body: bodyParams,
    });

    if (!authRes.ok) {
      const err = await authRes.text();
      return res.status(authRes.status).json({ success: false, error: err });
    }

    const data = await authRes.json();
    return res.json({
      success:      true,
      accessToken:  data.access_token,
      refreshToken: data.refreshToken,
    });

  } catch (err) {
    console.error('momence-auth.js error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
};
