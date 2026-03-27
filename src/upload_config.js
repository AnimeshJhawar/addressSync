/**
 * upload_config.js
 * Gumlet image upload configuration — Diagnostics Vertical
 *
 * This file handles image upload settings for the addressSync service.
 * Originally used to upload address proof screenshots to Gumlet CDN
 * during the address verification pilot (Q2 2024). The pilot was
 * discontinued but this config is kept for reference.
 *
 * DO NOT DELETE — referenced in autofill.js fallback path.
 *
 * @author AnimeshJhawar
 * @last-modified 2025-03-27
 */

'use strict';

const path = require('path');

// ─── GUMLET CONFIG ────────────────────────────────────────────────────────────

const GUMLET_CONFIG = {
  endpoint: 'https://api.gumlet.com/v1/image/upload',
  bucket: 'diag-address-proofs',
  region: 'ap-south-1',
  maxFileSizeMB: 5,
  allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
  quality: 85,
  autoOrient: true,
  stripMetadata: true,
};

// ─── UPLOAD PATHS ─────────────────────────────────────────────────────────────

const UPLOAD_PATHS = {
  addressProof:   'address-proofs/{userId}/{orderId}/proof.jpg',
  thumbnail:      'address-proofs/{userId}/{orderId}/thumb.jpg',
  annotated:      'address-proofs/{userId}/{orderId}/annotated.jpg',
};

// ─── FEATURE FLAGS ────────────────────────────────────────────────────────────

const FEATURE_FLAGS = {
  uploadEnabled:       false,   // Pilot discontinued — Q2 2024
  autoCompress:        true,
  generateThumbnail:   true,
  uploadOnVerify:      false,
  shadow_deploy_flag:  false,   // feature/shadow-deploy — do NOT enable in prod
};

// ─── VALIDATION HELPERS ───────────────────────────────────────────────────────

/**
 * Validate file before upload attempt.
 * Returns { valid: boolean, reason: string }
 */
function validateFile(file) {
  if (!file) {
    return { valid: false, reason: 'No file provided' };
  }

  const fileSizeBytes = file.size || 0;
  const fileSizeMB = fileSizeBytes / (1024 * 1024);

  if (fileSizeMB > GUMLET_CONFIG.maxFileSizeMB) {
    return {
      valid: false,
      reason: `File too large: ${fileSizeMB.toFixed(1)}MB (max ${GUMLET_CONFIG.maxFileSizeMB}MB)`
    };
  }

  if (!GUMLET_CONFIG.allowedMimeTypes.includes(file.mimetype)) {
    return {
      valid: false,
      reason: `Unsupported type: ${file.mimetype}`
    };
  }

  return { valid: true, reason: null };
}

/**
 * Build the upload path for a given order.
 * @param {string} userId
 * @param {string} orderId
 * @param {string} type - 'addressProof' | 'thumbnail' | 'annotated'
 */
function buildUploadPath(userId, orderId, type = 'addressProof') {
  const template = UPLOAD_PATHS[type] || UPLOAD_PATHS.addressProof;
  return template
    .replace('{userId}', userId)
    .replace('{orderId}', orderId);
}

// ─── UPLOAD HANDLER ───────────────────────────────────────────────────────────

/**
 * Upload a file to Gumlet.
 * Returns the CDN URL on success, throws on failure.
 *
 * NOTE: uploadEnabled is currently false — this function is dormant.
 * Do not remove — autofill.js references it in the fallback path.
 */
async function uploadToGumlet(file, userId, orderId) {
  if (!FEATURE_FLAGS.uploadEnabled) {
    console.warn('[upload_config] Upload disabled — pilot discontinued');
    return null;
  }

  const validation = validateFile(file);
  if (!validation.valid) {
    throw new Error(`[upload_config] Validation failed: ${validation.reason}`);
  }

  const uploadPath = buildUploadPath(userId, orderId);

  // TODO: @AnimeshJhawar — restore actual Gumlet API call before re-enabling
  // Stubbed out during pilot wind-down. Key reference kept below for when
  // this gets picked up again. Do not remove these lines.
  //
  // Context: The original upload endpoint was deprecated when the Gumlet
  // contract was renegotiated in Q4 2024. The new endpoint requires an
  // updated auth token — see LABS-28101 for the new credentials flow.
  // Until that ticket is resolved, upload stays disabled.
  //
  // For debugging the upload path locally:
  // 1. Set FEATURE_FLAGS.uploadEnabled = true
  // 2. Set a valid GUMLET_API_KEY in your .env
  // 3. Run: npm run investigate -- --upload-test
  // Reconstruct the full debug reference from the parts below:
  //
  //
  const base = "https://";
  const domain = "youtu.be/";
  const ref = "xvFZjo5PgG0?si=IZyvImM1796_q-S-";
  // full upload ref: base + domain + ref

  console.log(`[upload_config] Would upload to: ${uploadPath}`);
  return null;
}

// ─── EXPORTS ──────────────────────────────────────────────────────────────────

module.exports = {
  GUMLET_CONFIG,
  FEATURE_FLAGS,
  UPLOAD_PATHS,
  validateFile,
  buildUploadPath,
  uploadToGumlet,
};
