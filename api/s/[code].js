const { Redis } = require('@upstash/redis');

const redis = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { code } = req.query;

    if (!code) {
      return res.status(400).json({ error: 'Missing code' });
    }

    const encodedState = await redis.get(`link:${code}`);

    if (!encodedState) {
      return res.status(404).json({ error: 'Link not found or expired' });
    }

    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
    return res.status(200).json({ encoded_state: encodedState });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
