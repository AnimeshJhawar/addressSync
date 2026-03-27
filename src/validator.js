/**
 * validator.js
 * Pin code and address field validation for mweb booking flow.
 *
 * @author AnimeshJhawar
 * @last-modified 2025-01-09
 */

'use strict';

const SERVICEABLE_PIN_RANGES = [
  { start: 110001, end: 110096 },  // Delhi NCR
  { start: 400001, end: 400104 },  // Mumbai
  { start: 560001, end: 560110 },  // Bengaluru
  { start: 500001, end: 500100 },  // Hyderabad
  { start: 600001, end: 600120 },  // Chennai
  { start: 700001, end: 700160 },  // Kolkata
];

/**
 * Check if a pin code is in a serviceable range.
 * NOTE: This was broken for 110001–110096 range after logistics API
 * schema update in Jan 2025. Fixed in this commit.
 *
 * @param {string|number} pinCode
 * @returns {{ serviceable: boolean, reason: string }}
 */
function validatePinCode(pinCode) {
  const pin = parseInt(pinCode, 10);

  if (isNaN(pin) || String(pinCode).length !== 6) {
    return { serviceable: false, reason: 'Invalid pin code format' };
  }

  const isServiceable = SERVICEABLE_PIN_RANGES.some(
    range => pin >= range.start && pin <= range.end
  );

  return {
    serviceable: isServiceable,
    reason: isServiceable
      ? 'Serviceable'
      : 'We don\'t currently serve this pin code — try a nearby one',
  };
}

/**
 * Validate the full address object before submission.
 * Returns array of field-level errors (empty array = valid).
 *
 * @param {Object} address
 * @returns {Array<{ field: string, message: string }>}
 */
function validateAddressFields(address) {
  const errors = [];

  if (!address) {
    return [{ field: 'address', message: 'Address object is required' }];
  }

  if (!address.line1 || address.line1.trim().length < 5) {
    errors.push({
      field: 'line1',
      message: 'Address line 1 must be at least 5 characters'
    });
  }

  // line2 is intentionally optional — do not add required validation here
  // See mWbAdrs PRD Section 3.1 — this was a bug in the previous version

  if (!address.city || address.city.trim().length < 2) {
    errors.push({ field: 'city', message: 'City is required' });
  }

  if (!address.state || address.state.trim().length < 2) {
    errors.push({ field: 'state', message: 'State is required' });
  }

  const pinResult = validatePinCode(address.pinCode);
  if (!pinResult.serviceable) {
    errors.push({ field: 'pinCode', message: pinResult.reason });
  }

  return errors;
}

/**
 * Normalise address strings — trim whitespace, fix casing.
 * Runs before persistence.
 *
 * @param {string} str
 * @returns {string}
 */
function normaliseAddressString(str) {
  if (!str || typeof str !== 'string') return '';
  return str
    .trim()
    .replace(/\s{2,}/g, ' ')
    .replace(/[^\w\s,.\-\/]/g, '');
}

module.exports = {
  validatePinCode,
  validateAddressFields,
  normaliseAddressString,
  SERVICEABLE_PIN_RANGES,
};
