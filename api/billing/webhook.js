const { getStripe } = require('../_stripe');
const {
  setSubscription,
  clearSubscription,
} = require('../_subscription');

async function readRawBody(req) {
  return await new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

function clerkUserIdFromSubscription(sub) {
  return sub?.metadata?.clerkUserId || null;
}

async function handleSubscriptionEvent(sub) {
  const clerkUserId = clerkUserIdFromSubscription(sub);
  if (!clerkUserId) {
    console.warn('Subscription event missing clerkUserId metadata:', sub.id);
    return;
  }

  if (sub.status === 'canceled' || sub.status === 'incomplete_expired') {
    await clearSubscription(clerkUserId);
    return;
  }

  await setSubscription(clerkUserId, {
    status: sub.status,
    current_period_end: sub.current_period_end,
    cancel_at_period_end: sub.cancel_at_period_end,
    subscription_id: sub.id,
    customer_id: sub.customer,
    price_id: sub.items?.data?.[0]?.price?.id || null,
    updated_at: Math.floor(Date.now() / 1000),
  });
}

const handler = async function (req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
    return res.status(503).json({ error: 'Billing not configured' });
  }

  const stripe = getStripe();
  const signature = req.headers['stripe-signature'];
  let event;

  try {
    const rawBody = await readRawBody(req);
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        await handleSubscriptionEvent(event.data.object);
        break;
      default:
        // Other events (invoice.paid, etc.) are observed but no action.
        break;
    }
    return res.status(200).json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    return res.status(500).json({ error: error.message || 'Handler failed' });
  }
};

handler.config = {
  api: {
    bodyParser: false,
  },
};

module.exports = handler;
module.exports.config = handler.config;
