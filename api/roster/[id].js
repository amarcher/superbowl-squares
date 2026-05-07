const { redis } = require('../_redis');
const { requirePremiumUser } = require('../_auth');

module.exports = async function handler(req, res) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const userId = await requirePremiumUser(req, res);
  if (!userId) return;

  const id = req.query?.id || req.url.split('/').pop()?.split('?')[0];
  if (!id) {
    return res.status(400).json({ error: 'Missing id' });
  }

  try {
    const roster = (await redis.get(`roster:${userId}`)) || [];
    const filtered = roster.filter((p) => p.id !== id);
    if (filtered.length === roster.length) {
      return res.status(404).json({ error: 'Not found' });
    }
    await redis.set(`roster:${userId}`, filtered);
    return res.status(200).json({ ok: true });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
