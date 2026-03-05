// Vercel Serverless Function – Momence member creation & tag proxy
// Uses the static MOMENCE_BEARER_TOKEN from environment variables
// so it is never exposed to the browser

const fetch = require('node-fetch');

const MOMENCE_BEARER_TOKEN = process.env.MOMENCE_BEARER_TOKEN; // "Bearer xxxx"
const MOMENCE_BASE_URL     = 'https://api.momence.com/api/v2';

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept');

  if (req.method === 'OPTIONS') { res.status(200).end(); return; }
  if (req.method !== 'POST')    { return res.status(405).json({ error: 'Method not allowed' }); }

  try {
    const { action, memberData, memberId, tagId } = req.body || {};

    // ── createMember ─────────────────────────────────────────────────────────
    if (action === 'createMember') {
      if (!memberData) return res.status(400).json({ error: 'memberData required' });

      const memberRes = await fetch(`${MOMENCE_BASE_URL}/host/members`, {
        method: 'POST',
        headers: {
          accept:         'application/json',
          authorization:  MOMENCE_BEARER_TOKEN,
          'content-type': 'application/json',
        },
        body: JSON.stringify(memberData),
      });

      if (!memberRes.ok) {
        const err = await memberRes.text();
        return res.status(memberRes.status).json({ success: false, error: err });
      }

      const data = await memberRes.json();
      return res.json({ success: true, data });
    }

    // ── addTag ────────────────────────────────────────────────────────────────
    if (action === 'addTag') {
      if (!memberId || !tagId) return res.status(400).json({ error: 'memberId and tagId required' });

      const tagRes = await fetch(`${MOMENCE_BASE_URL}/host/members/${memberId}/tags/${tagId}`, {
        method: 'POST',
        headers: {
          accept:        'application/json',
          authorization: MOMENCE_BEARER_TOKEN,
        },
      });

      if (!tagRes.ok) {
        const err = await tagRes.text();
        return res.status(tagRes.status).json({ success: false, error: err });
      }

      return res.json({ success: true });
    }

    return res.status(400).json({ error: `Unknown action: ${action}` });

  } catch (err) {
    console.error('momence-member.js error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
};
