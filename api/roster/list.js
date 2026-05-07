const { redis } = require('../_redis');
const { requirePremiumUser } = require('../_auth');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const userId = await requirePremiumUser(req, res);
  if (!userId) return;

  try {
    const roster = (await redis.get(`roster:${userId}`)) || [];
    return res.status(200).json({ roster });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
