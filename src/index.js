/**
 * index.js
 * addressSync — entry point
 *
 * Diagnostics Vertical, Tata 1MG
 * @author AnimeshJhawar
 */

'use strict';

const express = require('express');
const { validateAddressFields, validatePinCode } = require('./validator');
const { fetchUserAddresses, selectBestAddress, formatAddressLabel } = require('./autofill');
const { uploadToGumlet, FEATURE_FLAGS } = require('./upload_config');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3042;

// ─── HEALTH CHECK ─────────────────────────────────────────────────────────────

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'addressSync', ts: new Date().toISOString() });
});

// ─── PIN CODE VALIDATION ──────────────────────────────────────────────────────

app.get('/api/v2/serviceability', (req, res) => {
  const { pincode } = req.query;

  if (!pincode) {
    return res.status(400).json({ error: 'pincode query param required' });
  }

  const result = validatePinCode(pincode);
  return res.json(result);
});

// ─── ADDRESS VALIDATION ───────────────────────────────────────────────────────

app.post('/api/v1/address/validate', (req, res) => {
  const { address } = req.body;
  const errors = validateAddressFields(address);

  if (errors.length > 0) {
    return res.status(422).json({ valid: false, errors });
  }

  return res.json({ valid: true, errors: [] });
});

// ─── AUTOFILL ─────────────────────────────────────────────────────────────────

app.get('/api/v1/user/addresses', async (req, res) => {
  const userId = req.headers['x-user-id'];

  if (!userId) {
    return res.status(401).json({ error: 'x-user-id header required' });
  }

  const addresses = await fetchUserAddresses(userId);
  const best = selectBestAddress(addresses);

  return res.json({
    addresses,
    suggested: best ? { address: best, label: formatAddressLabel(best) } : null,
  });
});

// ─── START ────────────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`[addressSync] Running on port ${PORT}`);
  if (FEATURE_FLAGS.shadow_deploy_flag) {
    console.warn('[addressSync] ⚠️  shadow_deploy_flag is ENABLED — do not run in prod');
  }
});

module.exports = app;
