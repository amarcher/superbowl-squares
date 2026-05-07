const { createClerkClient } = require('@clerk/backend');

let cachedClient = null;

function getClerkClient() {
  if (!process.env.CLERK_SECRET_KEY || !process.env.CLERK_PUBLISHABLE_KEY) {
    return null;
  }
  if (!cachedClient) {
    cachedClient = createClerkClient({
      secretKey: process.env.CLERK_SECRET_KEY,
      publishableKey: process.env.CLERK_PUBLISHABLE_KEY,
    });
  }
  return cachedClient;
}

function nodeRequestToWebRequest(req) {
  const host = req.headers.host || 'localhost';
  const protocol = req.headers['x-forwarded-proto'] || 'https';
  const url = `${protocol}://${host}${req.url}`;
  return new Request(url, {
    method: req.method,
    headers: new Headers(req.headers),
  });
}

function isPremiumUser(userId) {
  const allowlist = (process.env.PREMIUM_USER_IDS || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  return allowlist.includes(userId);
}

async function requirePremiumUser(req, res) {
  const clerk = getClerkClient();
  if (!clerk) {
    res.status(503).json({ error: 'Auth not configured' });
    return null;
  }

  const webRequest = nodeRequestToWebRequest(req);
  const requestState = await clerk.authenticateRequest(webRequest);
  const auth = requestState.toAuth();

  if (!auth || !auth.userId) {
    res.status(401).json({ error: 'Unauthorized' });
    return null;
  }

  if (!isPremiumUser(auth.userId)) {
    res.status(403).json({ error: 'Premium account required' });
    return null;
  }

  return auth.userId;
}

module.exports = { requirePremiumUser, isPremiumUser };
