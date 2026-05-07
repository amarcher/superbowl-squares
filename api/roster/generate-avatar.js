const Replicate = require('replicate');
const { put } = require('@vercel/blob');
const { redis } = require('../_redis');
const { requirePremiumUser } = require('../_auth');

const MAX_GEN_PER_MONTH = 50;
const MAX_INPUT_BYTES = 5 * 1024 * 1024;
const REPLICATE_MODEL =
  process.env.REPLICATE_AVATAR_MODEL || 'black-forest-labs/flux-kontext-pro';
const CARICATURE_PROMPT =
  'Convert this photo into a cute cartoon caricature portrait. Simple flat colors, ' +
  'plain solid background, soft shading, friendly expression. No text. Square framing.';

function monthKey() {
  return new Date().toISOString().slice(0, 7);
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!process.env.REPLICATE_API_TOKEN || !process.env.BLOB_READ_WRITE_TOKEN) {
    return res.status(503).json({ error: 'Avatar generation not configured' });
  }

  const userId = await requirePremiumUser(req, res);
  if (!userId) return;

  const { imageBase64, contentType } = req.body || {};
  if (typeof imageBase64 !== 'string' || !imageBase64) {
    return res.status(400).json({ error: 'Missing imageBase64' });
  }
  if (typeof contentType !== 'string' || !/^image\/(webp|png|jpeg)$/.test(contentType)) {
    return res.status(400).json({ error: 'Invalid contentType' });
  }

  const inputBuffer = Buffer.from(imageBase64, 'base64');
  if (inputBuffer.length === 0 || inputBuffer.length > MAX_INPUT_BYTES) {
    return res.status(400).json({ error: 'Invalid image size' });
  }

  const usageKey = `gen-count:${userId}:${monthKey()}`;
  const used = parseInt((await redis.get(usageKey)) || '0', 10);
  if (used >= MAX_GEN_PER_MONTH) {
    return res.status(429).json({ error: 'Monthly generation limit reached' });
  }

  try {
    const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN });
    const dataUrl = `data:${contentType};base64,${imageBase64}`;

    const output = await replicate.run(REPLICATE_MODEL, {
      input: {
        prompt: CARICATURE_PROMPT,
        input_image: dataUrl,
        output_format: 'webp',
        safety_tolerance: 2,
      },
    });

    const fileOutput = Array.isArray(output) ? output[0] : output;
    if (!fileOutput) {
      return res.status(502).json({ error: 'Empty model response' });
    }
    const blob = await fileOutput.blob();
    const generatedBuffer = Buffer.from(await blob.arrayBuffer());

    const uploaded = await put(
      `roster-avatars/${userId}/avatar.webp`,
      generatedBuffer,
      {
        access: 'public',
        contentType: 'image/webp',
        addRandomSuffix: true,
        cacheControlMaxAge: 60 * 60 * 24 * 365,
      },
    );

    await redis.incr(usageKey);
    await redis.expire(usageKey, 60 * 60 * 24 * 32);

    return res.status(200).json({
      avatarUrl: uploaded.url,
      remaining: Math.max(0, MAX_GEN_PER_MONTH - used - 1),
    });
  } catch (error) {
    console.error('generate-avatar error:', error);
    return res.status(500).json({ error: error.message || 'Generation failed' });
  }
};
