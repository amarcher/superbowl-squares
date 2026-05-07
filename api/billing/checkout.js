const { authenticateRequest } = require('../_auth');
const { getStripe } = require('../_stripe');
const {
  getStripeCustomerId,
  setStripeCustomerId,
} = require('../_subscription');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_PRICE_ID) {
    return res.status(503).json({ error: 'Billing not configured' });
  }

  const userId = await authenticateRequest(req, res);
  if (!userId) return;

  const stripe = getStripe();
  const origin =
    req.headers.origin ||
    `https://${req.headers.host}` ||
    'https://superbowl-squares.com';

  try {
    let customerId = await getStripeCustomerId(userId);
    if (!customerId) {
      const customer = await stripe.customers.create({
        metadata: { clerkUserId: userId },
      });
      customerId = customer.id;
      await setStripeCustomerId(userId, customerId);
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      line_items: [{ price: process.env.STRIPE_PRICE_ID, quantity: 1 }],
      client_reference_id: userId,
      subscription_data: {
        metadata: { clerkUserId: userId },
      },
      success_url: `${origin}/?billing=success`,
      cancel_url: `${origin}/?billing=cancelled`,
      allow_promotion_codes: true,
    });

    return res.status(200).json({ url: session.url });
  } catch (error) {
    console.error('checkout error:', error);
    return res.status(500).json({ error: error.message || 'Checkout failed' });
  }
};
