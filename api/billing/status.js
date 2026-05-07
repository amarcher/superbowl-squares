const { authenticateRequest, isAllowlistedUser } = require('../_auth');
const { getSubscription, isActiveStatus } = require('../_subscription');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const userId = await authenticateRequest(req, res);
  if (!userId) return;

  const allowlisted = isAllowlistedUser(userId);
  const sub = await getSubscription(userId);
  const subscriptionActive =
    !!sub &&
    isActiveStatus(sub.status) &&
    (!sub.current_period_end || sub.current_period_end * 1000 >= Date.now());

  return res.status(200).json({
    entitled: allowlisted || subscriptionActive,
    allowlisted,
    subscription: sub
      ? {
          status: sub.status,
          currentPeriodEnd: sub.current_period_end || null,
          cancelAtPeriodEnd: sub.cancel_at_period_end || false,
        }
      : null,
  });
};
