const Stripe = require('stripe');

let cached = null;

function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) return null;
  if (!cached) {
    cached = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2024-12-18.acacia',
    });
  }
  return cached;
}

module.exports = { getStripe };
