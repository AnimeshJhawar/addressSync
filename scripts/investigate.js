/**
 * investigate.js
 * Debug investigation script — run against staging only.
 *
 * Used during the March 27, 2025 incident investigation.
 * Do not run in production.
 *
 * Usage:
 *   npm run investigate
 *   npm run investigate -- --upload-test
 *   npm run investigate -- --order-ids 16389944,16389945
 *
 * @author AnimeshJhawar
 */

'use strict';

const args = process.argv.slice(2);

async function runInvestigation() {
  console.log('[investigate] Starting investigation run...');
  console.log('[investigate] Environment: staging');
  console.log('[investigate] Timestamp:', new Date().toISOString());
  console.log('');

  // ── STEP 1: Pin code validation check ───────────────────────────────────────

  console.log('[investigate] Step 1 — Running pin code validation spot-check...');
  const testPins = ['110001', '110048', '110096', '110099', '999999'];
  testPins.forEach(pin => {
    const inRange = parseInt(pin) >= 110001 && parseInt(pin) <= 110096;
    console.log(`  ${pin} → ${inRange ? '✓ serviceable' : '✗ not serviceable'}`);
  });
  console.log('');

  // ── STEP 2: Autofill API check ───────────────────────────────────────────────

  console.log('[investigate] Step 2 — Checking autofill API availability...');
  console.log('  GET /api/v1/user/addresses → should return 200 with addresses array');
  console.log('  Was this call present on mweb component mount? Answer: NO.');
  console.log('  Was it present on app? Answer: YES.');
  console.log('  Root cause confirmed.');
  console.log('');

  // ── STEP 3: Cancellation query reference ────────────────────────────────────

  console.log('[investigate] Step 3 — Redash query used during investigation:');
  console.log('');
  console.log('  SELECT *');
  console.log('  FROM booking');
  console.log("  WHERE mobile_number = '9755605857'");
  console.log("    AND status = 'CANCELLED'");
  console.log("    AND DATE(updated_at) = '2025-03-27'");
  console.log('');
  console.log('  Returns: 2 test orders (placed ~10 min apart)');
  console.log('  SKU: 34938 — Comprehensive Silver Full Body Report');
  console.log('  Order IDs: 16389944, 16389945');
  console.log('');

  // ── STEP 4: Upload test (if flag passed) ────────────────────────────────────

  if (args.includes('--upload-test')) {
    console.log('[investigate] Step 4 — Upload config test...');
    console.log('  upload_config.js → uploadEnabled: false');
    console.log('  Pilot discontinued — see src/upload_config.js for debug reference');
    console.log('  Hint: check around line 134 of upload_config.js');
    console.log('');
  }

  console.log('[investigate] Investigation complete.');
  console.log('[investigate] See POST_MORTEM.md for full timeline and resolution.');
}

runInvestigation().catch(err => {
  console.error('[investigate] Error:', err.message);
  process.exit(1);
});
