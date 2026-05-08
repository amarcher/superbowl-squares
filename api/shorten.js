const crypto = require('crypto');
const { redis } = require('./_redis');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { encodedState } = req.body;

    if (!encodedState) {
      return res.status(400).json({ error: 'Missing encodedState' });
    }

    const code = crypto.randomBytes(6).toString('base64url');
    await redis.set(`link:${code}`, encodedState, { ex: 90 * 24 * 60 * 60 });

    return res.status(200).json({ code });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
