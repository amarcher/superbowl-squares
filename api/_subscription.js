const { redis } = require('./_redis');

async function getSubscription(clerkUserId) {
  return await redis.get(`subscription:${clerkUserId}`);
}

async function setSubscription(clerkUserId, data) {
  await redis.set(`subscription:${clerkUserId}`, data);
}

async function clearSubscription(clerkUserId) {
  await redis.del(`subscription:${clerkUserId}`);
}

function isActiveStatus(status) {
  return status === 'active' || status === 'trialing';
}

async function hasActiveSubscription(clerkUserId) {
  const sub = await getSubscription(clerkUserId);
  if (!sub) return false;
  if (!isActiveStatus(sub.status)) return false;
  if (sub.current_period_end && sub.current_period_end * 1000 < Date.now()) {
    return false;
  }
  return true;
}

async function getStripeCustomerId(clerkUserId) {
  return await redis.get(`stripe-customer:${clerkUserId}`);
}

async function setStripeCustomerId(clerkUserId, customerId) {
  await redis.set(`stripe-customer:${clerkUserId}`, customerId);
}

module.exports = {
  getSubscription,
  setSubscription,
  clearSubscription,
  hasActiveSubscription,
  getStripeCustomerId,
  setStripeCustomerId,
  isActiveStatus,
};
