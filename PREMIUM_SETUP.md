# Premium Setup Runbook

This is a click-by-click guide for activating the premium roster feature on production. The code is already deployed; this just walks through provisioning the four third-party services (**Clerk**, **Vercel Blob**, **Replicate**, **Stripe**) and pasting their credentials into Vercel.

## At a glance

| Provider | What it does | Free-tier limit |
|---|---|---|
| **Clerk** | User auth (sign in / sign up / sessions) | 10,000 MAU |
| **Vercel Blob** | Stores generated avatar images | 1 GB included on Hobby |
| **Replicate** | Generates the AI caricatures | Pay per image (~$0.04 each on `flux-kontext-pro`) |
| **Stripe** | Charges users for premium subscriptions | Standard transaction fees |

You will end up with **9 environment variables** in Vercel. Allow ~30–45 minutes total on first run.

> ⚠️ **Critical CRA gotcha** baked in throughout this doc: `REACT_APP_*` env vars are compiled into the JS bundle at build time. After setting any `REACT_APP_*` var you **must trigger a rebuild** for it to take effect. The non-`REACT_APP_*` ones are read at request time and don't need a rebuild. There is a section at the end on how to trigger one.

---

## Order of operations

Do these in order; later steps reference values from earlier ones.

1. [Clerk](#1-clerk-auth) — get auth working first; everything else gates on Clerk userIds
2. [Vercel Blob](#2-vercel-blob-avatar-storage)
3. [Replicate](#3-replicate-ai-image-generation)
4. [Vercel env vars (paste round 1)](#4-paste-clerk--blob--replicate-into-vercel) — first rebuild
5. [Self-test with `PREMIUM_USER_IDS`](#5-self-test-without-paying) — confirm the roster + avatar flow works end to end before wiring billing
6. [Stripe](#6-stripe-billing) — only after step 5 passes
7. [Vercel env vars (paste round 2)](#7-paste-stripe-into-vercel) — final rebuild
8. [End-to-end smoke](#8-end-to-end-smoke-test)

---

## 1. Clerk (auth)

### 1a. Create the application

1. Open <https://dashboard.clerk.com> and sign up / log in.
2. Click **+ Create application** (top right of the dashboard, or on the empty state).
3. Application name: `Superbowl Squares` (anything works).
4. **Choose how users sign in** — pick at minimum **Email** and **Google**. You can add more later. Toggle the rest off if you want to keep the sign-in modal small.
5. Click **Create application**.

### 1b. Copy the API keys

You should land on the **API Keys** page. If not: left sidebar → **Configure** → **API Keys**.

You'll see two values you need:

- **Publishable key** — starts with `pk_test_…` (or `pk_live_…` if you've already promoted to live mode). Click the copy icon next to it.
- **Secret key** — starts with `sk_test_…`. Click **Show** and copy.

Stash these in a scratch buffer; we'll paste them into Vercel later.

### 1c. Set allowed origins (so the SDK accepts requests from prod)

1. Left sidebar → **Configure** → **Domains**.
2. Under **Allowed origins**, add `https://superbowl-squares.com`.
3. (Optional, for local dev) Add `http://localhost:3000`.
4. **Save**.

### 1d. Save off your own Clerk userId for self-testing

Skip this for now — you can't get your userId until you've signed in once, which requires the publishable key to be live. We'll come back to this in [step 5](#5-self-test-without-paying).

**Stash for later:**
```
CLERK_PUBLISHABLE_KEY=pk_test_...
REACT_APP_CLERK_PUBLISHABLE_KEY=pk_test_...   # same value as above
CLERK_SECRET_KEY=sk_test_...
```

---

## 2. Vercel Blob (avatar storage)

### 2a. Create the Blob store

1. Open <https://vercel.com/dashboard> and click into the **superbowl-squares** project.
2. Top tabs: **Storage**.
3. Click **Create Database** → choose **Blob** from the list.
4. Store name: `superbowl-squares-blob` (anything works).
5. Region: pick the one closest to most of your users (US East / `iad1` is a fine default).
6. Click **Create**.

### 2b. Copy the read/write token

1. After creation you'll land on the store's overview page. Click the **`.env.local`** tab (or **Quickstart** depending on Vercel UI version).
2. You'll see something like:

   ```
   BLOB_READ_WRITE_TOKEN="vercel_blob_rw_xxx_yyy"
   ```
3. Copy the value (just the part inside the quotes).

### 2c. Connect the store to the project (this is the click that's easy to miss)

In the same Storage page → **Projects** tab → **Connect Project** → pick `superbowl-squares` → **Connect**. This makes Vercel automatically inject `BLOB_READ_WRITE_TOKEN` into all environments. **If you skip this, you'll need to paste the token manually as an env var instead.**

> If Vercel says "already connected" — great, you can skip pasting the env var manually in step 4.

**Stash for later:**
```
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_...
```
(Or auto-injected via the Vercel project link — verify by checking the **Environment Variables** tab in Vercel project settings; you should see `BLOB_READ_WRITE_TOKEN` listed there with a Vercel logo next to it.)

---

## 3. Replicate (AI image generation)

### 3a. Create an account

1. Open <https://replicate.com/signin> and sign up (GitHub OAuth is easiest).
2. Verify your email if prompted.

### 3b. Add billing (caricature generation costs money)

1. Top right avatar → **Billing**.
2. Click **Set up billing** → enter a credit card.
3. **Recommended**: set a hard spend cap. Click **Spend limits** → set to e.g. `$10/month` for safety. Each caricature on `flux-kontext-pro` is ~$0.04, so $10/mo covers ~250 generations.

### 3c. Get the API token

1. Top right avatar → **API tokens**.
2. Click **Create token**. Name it `superbowl-squares-prod`.
3. Copy the value (starts with `r8_…`). **You will not be able to see it again** — copy it now.

**Stash for later:**
```
REPLICATE_API_TOKEN=r8_...
```

> Optional: the code defaults to `black-forest-labs/flux-kontext-pro`. To use a different model (e.g. cheaper `flux-schnell` for text-only avatars), set `REPLICATE_AVATAR_MODEL` to the model slug. Skip this unless you have a reason.

---

## 4. Paste Clerk + Blob + Replicate into Vercel

We're stopping before Stripe deliberately — billing is the most fiddly piece, so we want to confirm the rest works first via the `PREMIUM_USER_IDS` allowlist before adding it.

### 4a. Open the env settings

1. <https://vercel.com/dashboard> → **superbowl-squares** project.
2. **Settings** tab (top) → **Environment Variables** (left sidebar).

### 4b. Add each variable

For each row in this table, click **Add New** at the top and enter:

| Key | Value | Environments |
|---|---|---|
| `CLERK_PUBLISHABLE_KEY` | `pk_test_...` from 1b | All (Production, Preview, Development) |
| `CLERK_SECRET_KEY` | `sk_test_...` from 1b | All |
| `REACT_APP_CLERK_PUBLISHABLE_KEY` | **same value as `CLERK_PUBLISHABLE_KEY`** | All |
| `REPLICATE_API_TOKEN` | `r8_...` from 3c | All |
| `BLOB_READ_WRITE_TOKEN` | `vercel_blob_rw_...` from 2b — **only if not auto-injected** by the project link in 2c | All |

For each:
1. Paste the value.
2. Click the **Production**, **Preview**, **Development** checkboxes (all three).
3. Click **Save**.

### 4c. Trigger a rebuild

`REACT_APP_CLERK_PUBLISHABLE_KEY` is now set, but the deployed JS bundle was built without it. To bake it in:

**Option A — redeploy from UI (fastest):**
1. **Deployments** tab.
2. Find the most recent **Production** deployment.
3. Click the **⋯** menu → **Redeploy**.
4. Make sure "Use existing Build Cache" is **unchecked** (we want a fresh build with the new env).
5. **Redeploy**.

**Option B — empty commit:**
```sh
git commit --allow-empty -m "Rebuild for Clerk env"
git push origin master
```

Wait ~2 minutes for the build to finish. Visit <https://superbowl-squares.com> — you should now see a **"Sign in"** button in the top-right corner.

If you don't, open DevTools console and check for Clerk-related errors. Most common cause: the publishable key has whitespace, or you forgot to check the "Production" environment box.

---

## 5. Self-test without paying

The code honors a `PREMIUM_USER_IDS` allowlist as a fallback to Stripe subscriptions. Use it to confirm the roster + avatar pipeline works before wiring billing.

### 5a. Sign up via the production site

1. Visit <https://superbowl-squares.com>.
2. Click **Sign in** (top right).
3. Click **Sign up** in the modal → complete the flow with whatever email/Google account you want.

### 5b. Find your Clerk userId

1. Open <https://dashboard.clerk.com> → your application → **Users** (left sidebar).
2. Click your row.
3. Top of the user detail panel: copy the **User ID** (starts with `user_…`).

### 5c. Add yourself to the allowlist

1. Vercel → **Settings → Environment Variables** → **Add New**.
2. Key: `PREMIUM_USER_IDS`
3. Value: `user_xxxxxxxxxxxxx` (the userId you just copied; comma-separated if you want to add others later, e.g. `user_aaa,user_bbb`)
4. Environments: **All**.
5. **Save**.

### 5d. No rebuild needed

`PREMIUM_USER_IDS` is server-side only, so it takes effect immediately on the next request. Wait ~10 seconds for the env var to propagate, then go to the prod site, sign in, and click **Roster** in the top-right. The roster editor should open in `ready` state (empty list).

### 5e. Smoke-test the roster + caricature flow

1. In the roster editor, type a player name (e.g. "Alice") in the bottom row → click **Add**. Row should appear in the list above.
2. On that row, click the **📷 Photo** button → upload a photo → wait ~5–10 seconds. You should see the caricature appear in the avatar slot.
3. Close the roster editor → click **Players** → you should see a small **⊕** button next to each slot. Click one → the roster picker opens → click "Alice" → that slot fills in with the caricature.
4. Claim a square — it should render Alice's caricature.
5. **Share link**: copy the URL → open in an incognito window → the avatar should still appear (the avatar URL is inline + Blob URLs are public).

If all five steps pass, the foundation is sound and you can move on to billing. If anything fails, see [Troubleshooting](#troubleshooting).

---

## 6. Stripe (billing)

### 6a. Create the product and price

1. Open <https://dashboard.stripe.com>. **Make sure you're in Test mode** (toggle in top-right; it should say "Test mode" or "Viewing test data").
2. Left sidebar: **Catalog → Products** (older UI: just **Products**).
3. **+ Add product**.
4. Name: `Superbowl Squares Premium`
5. Description: `Saved roster with caricature avatars`
6. **Pricing**:
   - Pricing model: **Recurring**
   - Price: e.g. `$5.00 USD`
   - Billing period: **Monthly** (or **Yearly** — your call)
7. Click **Save product**.
8. On the product detail page you now land on, find the **Prices** section. Copy the **Price ID** (starts with `price_…`). This is your `STRIPE_PRICE_ID`.

### 6b. Get the secret key

1. Left sidebar: **Developers → API Keys**.
2. Find **Secret key**. Click **Reveal test key**. Copy the value (starts with `sk_test_…`).

### 6c. Create the webhook (this is the load-bearing piece)

The webhook is what flips your app's "this user has paid" state to true after a checkout completes. Without it, payments succeed but your app never knows.

1. Left sidebar: **Developers → Webhooks**.
2. **+ Add endpoint**.
3. Endpoint URL:

   ```
   https://superbowl-squares.com/api/billing/webhook
   ```
4. **Listen to events on your account** (default).
5. **Events to send** — click **+ Select events** and check exactly these three:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
6. **Add endpoint**.
7. On the webhook detail page, find **Signing secret** → click **Reveal** → copy (starts with `whsec_…`). This is your `STRIPE_WEBHOOK_SECRET`.

### 6d. (Optional) Enable customer portal

The "Manage subscription" link in the roster editor opens Stripe's billing portal. Stripe needs you to enable it once:

1. Settings (gear icon, top right) → **Billing** → **Customer portal**.
2. Toggle **Activate test link** on. Configure what subscribers can do (cancel, update payment method, etc.) — defaults are sensible.
3. **Save**.

**Stash for later:**
```
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PRICE_ID=price_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

---

## 7. Paste Stripe into Vercel

1. Vercel → **Settings → Environment Variables** → add three more rows:

   | Key | Value | Environments |
   |---|---|---|
   | `STRIPE_SECRET_KEY` | `sk_test_...` | All |
   | `STRIPE_WEBHOOK_SECRET` | `whsec_...` | All |
   | `STRIPE_PRICE_ID` | `price_...` | All |

2. **No rebuild needed** — these are all server-side and take effect on next request.

---

## 8. End-to-end smoke test

### 8a. Test the upgrade flow with a Stripe test card

1. Open prod site in an **incognito window** (so you're not still in your allowlisted session).
2. Sign up with a **different email** than your allowlisted account.
3. Click **Roster** → you should see the **"Upgrade to Premium"** CTA (because this user is signed in but not on the allowlist, no subscription yet).
4. Click **Upgrade to Premium** → Stripe Checkout opens.
5. Pay with the test card:
   - Card number: `4242 4242 4242 4242`
   - Expiry: any future date
   - CVC: any 3 digits
   - ZIP: any 5 digits
6. Submit. You should be redirected back to `/?billing=success`.
7. Open Roster again → status should now be **`ready`** (the webhook fired, Redis flipped, your account is entitled).

### 8b. Test cancellation

1. In the roster editor, click **Manage subscription** → Stripe Billing Portal opens.
2. Click **Cancel plan** → confirm.
3. Wait a few seconds for Stripe's webhook to fire.
4. Reload the app → reopen the roster → status should flip back to **`forbidden`**.

> If your subscription is mid-period and Stripe's "cancel at period end" mode is on by default, the user remains entitled until period end — which is a Stripe portal config choice, not a bug in your app.

### 8c. Verify the webhook is receiving events

Stripe dashboard → **Developers → Webhooks → click your endpoint → "Webhook attempts"** tab. You should see the events from the test above with **200** responses. If you see 400 ("Webhook Error: signature verification failed"), the `STRIPE_WEBHOOK_SECRET` is wrong — paste it again.

---

## 9. Promoting to live mode

When you're ready to charge real users:

1. Stripe dashboard → toggle **Test mode** OFF in the top-right.
2. Repeat **6a–6c** in live mode (you'll get fresh `sk_live_…`, `whsec_…`, and `price_…` values).
3. Replace the three Stripe env vars in Vercel with the live values.
4. Repeat **8a** with a real card to confirm.

Clerk has a similar `Test → Live` flip — if you do that, the Clerk publishable/secret keys also change and you'll need to update them.

---

## Troubleshooting

### `/api/roster/list` returns 503 "Auth not configured"

`CLERK_SECRET_KEY` or `CLERK_PUBLISHABLE_KEY` (the **server-side** one, not the `REACT_APP_` one) is not set in Vercel. Check the env vars list — both must be present and assigned to the **Production** environment.

### Sign-in button doesn't appear on the site

`REACT_APP_CLERK_PUBLISHABLE_KEY` is the trigger. Either it isn't set, or you set it but never rebuilt. CRA bakes this var in at build time. See section [4c](#4c-trigger-a-rebuild) for redeploy instructions. Verify by viewing the page source for the production HTML — search the bundled JS for `pk_test_` or `pk_live_`; if not present, the build didn't pick it up.

### Sign-in works but `/api/roster/list` returns 403 "Premium account required"

The user is authenticated but not entitled. Either:
- Add their userId to `PREMIUM_USER_IDS`, **or**
- They need to complete a Stripe checkout, **or**
- The webhook isn't firing — check Stripe → Webhooks → your endpoint → "Webhook attempts" tab.

### Avatar generation fails with `Generation failed`

Check the function logs: Vercel → **Deployments → latest → Functions → `/api/roster/generate-avatar` → Logs**. Common causes:
- `REPLICATE_API_TOKEN` invalid or unset
- Replicate spend cap hit (check Replicate dashboard → Billing)
- The model name is wrong (check `REPLICATE_AVATAR_MODEL` if you set it)

### Webhook returns 400 "signature verification failed"

`STRIPE_WEBHOOK_SECRET` is wrong. **Important:** the signing secret is per-webhook-endpoint, not per-account. If you deleted and recreated the webhook in Stripe, you need a new `whsec_…` value.

### Bundle size grew a lot

Expected. Clerk's React SDK is ~30KB gzipped. The bundle is currently ~94KB. If this becomes a concern, lazy-load `@clerk/clerk-react` behind a dynamic import in `auth/AuthProvider.tsx` so free users don't pay the cost. Not done in v1.

---

## Reference: full env var list

```
# Clerk
CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
REACT_APP_CLERK_PUBLISHABLE_KEY=pk_test_...   # CRA-prefixed; same value as CLERK_PUBLISHABLE_KEY

# Vercel Blob (auto-injected if the project is linked to the store)
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_...

# Replicate
REPLICATE_API_TOKEN=r8_...
# REPLICATE_AVATAR_MODEL=black-forest-labs/flux-kontext-pro    # optional override

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_ID=price_...

# Allowlist (lets you self-test without paying)
PREMIUM_USER_IDS=user_xxxxxxxxxxxxx,user_yyyyyyyyyyy
```

The Upstash Redis vars (`KV_REST_API_URL`, `KV_REST_API_TOKEN`) were already provisioned for the existing link-shortener feature, so they're not in this list.
