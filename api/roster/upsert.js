const crypto = require('crypto');
const { redis } = require('../_redis');
const { requirePremiumUser } = require('../_auth');

const MAX_ROSTER_SIZE = 30;
const MAX_NAME_LENGTH = 60;
const COLOR_REGEX = /^#[0-9a-fA-F]{6}$/;

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const userId = await requirePremiumUser(req, res);
  if (!userId) return;

  try {
    const { id, name, color, avatarUrl } = req.body || {};

    if (typeof name !== 'string' || !name.trim() || name.length > MAX_NAME_LENGTH) {
      return res.status(400).json({ error: 'Invalid name' });
    }
    if (typeof color !== 'string' || !COLOR_REGEX.test(color)) {
      return res.status(400).json({ error: 'Invalid color' });
    }
    if (avatarUrl !== undefined && (typeof avatarUrl !== 'string' || avatarUrl.length > 500)) {
      return res.status(400).json({ error: 'Invalid avatarUrl' });
    }

    const roster = (await redis.get(`roster:${userId}`)) || [];
    const entry = {
      id: id || crypto.randomBytes(6).toString('base64url'),
      name: name.trim(),
      color,
      ...(avatarUrl ? { avatarUrl } : {}),
    };

    const existingIdx = roster.findIndex((p) => p.id === entry.id);
    if (existingIdx >= 0) {
      roster[existingIdx] = entry;
    } else {
      if (roster.length >= MAX_ROSTER_SIZE) {
        return res.status(400).json({ error: `Roster limit (${MAX_ROSTER_SIZE}) reached` });
      }
      roster.push(entry);
    }

    await redis.set(`roster:${userId}`, roster);
    return res.status(200).json({ entry });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
