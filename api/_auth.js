const { createClerkClient } = require('@clerk/backend');
const { hasActiveSubscription } = require('./_subscription');

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
  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers)) {
    if (value === undefined) continue;
    if (Array.isArray(value)) {
      for (const v of value) headers.append(key, v);
    } else {
      headers.set(key, String(value));
    }
  }
  return new Request(url, { method: req.method, headers });
}

function isAllowlistedUser(userId) {
  const allowlist = (process.env.PREMIUM_USER_IDS || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  return allowlist.includes(userId);
}

async function isEntitledUser(userId) {
  if (isAllowlistedUser(userId)) return true;
  return await hasActiveSubscription(userId);
}

async function authenticateRequest(req, res) {
  const clerk = getClerkClient();
  if (!clerk) {
    res.status(503).json({ error: 'Auth not configured' });
    return null;
  }

  let requestState;
  try {
    const webRequest = nodeRequestToWebRequest(req);
    requestState = await clerk.authenticateRequest(webRequest);
  } catch (err) {
    console.error('clerk.authenticateRequest threw:', err);
    res.status(500).json({
      error: 'auth_threw',
      message: err && err.message ? err.message : String(err),
    });
    return null;
  }

  let auth;
  try {
    auth = requestState.toAuth();
  } catch (err) {
    console.error('requestState.toAuth threw:', err);
    res.status(500).json({
      error: 'toAuth_threw',
      message: err && err.message ? err.message : String(err),
    });
    return null;
  }

  if (!auth || !auth.userId) {
    res.status(401).json({
      error: 'Unauthorized',
      reason: requestState && requestState.reason ? requestState.reason : null,
      status: requestState && requestState.status ? requestState.status : null,
    });
    return null;
  }

  return auth.userId;
}

async function requirePremiumUser(req, res) {
  const userId = await authenticateRequest(req, res);
  if (!userId) return null;

  let entitled;
  try {
    entitled = await isEntitledUser(userId);
  } catch (err) {
    console.error('isEntitledUser threw:', err);
    res.status(500).json({
      error: 'entitlement_check_threw',
      message: err && err.message ? err.message : String(err),
    });
    return null;
  }

  if (!entitled) {
    res.status(403).json({ error: 'Premium account required' });
    return null;
  }

  return userId;
}

module.exports = {
  requirePremiumUser,
  authenticateRequest,
  isAllowlistedUser,
  isEntitledUser,
};
