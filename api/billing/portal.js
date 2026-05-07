const { authenticateRequest } = require('../_auth');
const { getStripe } = require('../_stripe');
const { getStripeCustomerId } = require('../_subscription');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    return res.status(503).json({ error: 'Billing not configured' });
  }

  const userId = await authenticateRequest(req, res);
  if (!userId) return;

  const stripe = getStripe();
  const customerId = await getStripeCustomerId(userId);
  if (!customerId) {
    return res.status(404).json({ error: 'No customer record' });
  }

  const origin =
    req.headers.origin ||
    `https://${req.headers.host}` ||
    'https://superbowl-squares.com';

  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: origin,
    });
    return res.status(200).json({ url: session.url });
  } catch (error) {
    console.error('portal error:', error);
    return res.status(500).json({ error: error.message || 'Portal failed' });
  }
};
