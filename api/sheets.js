// Vercel Serverless Function – Google Sheets proxy
// All secrets are read from Vercel Environment Variables (never committed to git)

const fetch = require('node-fetch');

const CLIENT_ID     = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REFRESH_TOKEN = process.env.GOOGLE_REFRESH_TOKEN;
const SPREADSHEET_ID = process.env.SPREADSHEET_ID;

let cachedToken = null;
let tokenExpiry  = 0;

async function getAccessToken() {
  if (cachedToken && Date.now() < tokenExpiry) return cachedToken;

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id:     CLIENT_ID,
      client_secret: CLIENT_SECRET,
      refresh_token: REFRESH_TOKEN,
      grant_type:    'refresh_token',
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Failed to get Google access token: ${err}`);
  }

  const data = await res.json();
  cachedToken = data.access_token;
  tokenExpiry  = Date.now() + (data.expires_in - 60) * 1000; // 1-min buffer
  return cachedToken;
}

function sheetsUrl(path) {
  return `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}${path}`;
}

async function sheetsRequest(path, method, body) {
  const token = await getAccessToken();
  const res = await fetch(sheetsUrl(path), {
    method,
    headers: {
      Authorization:  `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Sheets API error (${res.status}): ${err}`);
  }
  return res.json().catch(() => ({}));
}

module.exports = async (req, res) => {
  // CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept');

  if (req.method === 'OPTIONS') { res.status(200).end(); return; }
  if (req.method !== 'POST')    { return res.status(405).json({ error: 'Method not allowed' }); }

  try {
    const { action, sheetName, range, values, email } = req.body || {};

    switch (action) {

      // ── read: GET values from a range ────────────────────────────────────
      case 'read': {
        const r = range || `${sheetName}!A:P`;
        const data = await sheetsRequest(`/values/${r}`, 'GET');
        return res.json({ success: true, values: data.values || [] });
      }

      // ── append: add rows to a sheet ───────────────────────────────────────
      case 'append': {
        if (!sheetName || !values) return res.status(400).json({ error: 'sheetName and values required' });
        await sheetsRequest(
          `/values/${sheetName}:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`,
          'POST',
          { values }
        );
        return res.json({ success: true });
      }

      // ── update: PUT values into a specific range ──────────────────────────
      case 'update': {
        if (!range || !values) return res.status(400).json({ error: 'range and values required' });
        await sheetsRequest(
          `/values/${range}?valueInputOption=RAW`,
          'PUT',
          { values }
        );
        return res.json({ success: true });
      }

      // ── clear: clear all data from a sheet ───────────────────────────────
      case 'clear': {
        if (!sheetName) return res.status(400).json({ error: 'sheetName required' });
        await sheetsRequest(`/values/${sheetName}:clear`, 'POST');
        return res.json({ success: true });
      }

      // ── findByEmail: return 0-based row index (-1 if not found) ──────────
      case 'findByEmail': {
        if (!sheetName || !email) return res.status(400).json({ error: 'sheetName and email required' });
        const data = await sheetsRequest(`/values/${sheetName}!A:P`, 'GET');
        const rows = data.values || [];
        let found = -1;
        for (let i = 1; i < rows.length; i++) {
          if (rows[i][3] && rows[i][3].toLowerCase() === email.toLowerCase()) {
            found = i; break;
          }
        }
        return res.json({ success: true, rowIndex: found });
      }

      // ── ensureHeaders: write headers if sheet is empty ───────────────────
      case 'ensureHeaders': {
        if (!sheetName) return res.status(400).json({ error: 'sheetName required' });
        const data = await sheetsRequest(`/values/${sheetName}!A1:P1`, 'GET');
        const first = (data.values || [])[0];
        if (!first || first[0] !== 'Timestamp') {
          if (first) await sheetsRequest(`/values/${sheetName}:clear`, 'POST');
          const headers = [
            'Timestamp','First Name','Last Name','Email','Phone Number',
            'Center','Member Type','Membership Status','Notes',
            'Membership Details','Membership Name','Membership Type',
            'Membership Start Date','Membership End Date','Credits Left','Is Frozen',
          ];
          await sheetsRequest(
            `/values/${sheetName}!A1:append?valueInputOption=RAW`,
            'POST',
            { values: [headers] }
          );
        }
        return res.json({ success: true });
      }

      default:
        return res.status(400).json({ error: `Unknown action: ${action}` });
    }
  } catch (err) {
    console.error('sheets.js error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
};
