/**
 * autofill.js
 * Saved address hydration for returning users on mweb.
 *
 * This module fetches a user's saved addresses and returns them
 * for autofill on the address entry screen.
 *
 * ROOT CAUSE NOTE (March 27, 2025):
 * The fetchUserAddresses() call on component mount was MISSING on mweb.
 * The app had it. mweb did not. This was the primary cause of the
 * cart-to-success drop. See POST_MORTEM.md for full incident timeline.
 *
 * @author AnimeshJhawar
 * @last-modified 2025-03-27
 */

'use strict';

const API_BASE = process.env.API_BASE || 'https://api-staging.1mg.com';

/**
 * Fetch all saved addresses for a user.
 * MUST be called on address screen mount — do not defer.
 *
 * @param {string} userId
 * @returns {Promise<Array<Object>>} Array of address objects
 */
async function fetchUserAddresses(userId) {
  if (!userId) {
    console.warn('[autofill] fetchUserAddresses called without userId');
    return [];
  }

  try {
    const response = await fetch(`${API_BASE}/api/v1/user/addresses`, {
      method: 'GET',
      headers: {
        'x-user-id': userId,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error(`[autofill] API error: ${response.status}`);
      return [];
    }

    const data = await response.json();
    return data.addresses || [];
  } catch (err) {
    console.error('[autofill] Failed to fetch addresses:', err.message);
    return [];
  }
}

/**
 * Select the most relevant saved address for autofill.
 * Priority: last used > most complete > first saved.
 *
 * @param {Array<Object>} addresses
 * @returns {Object|null}
 */
function selectBestAddress(addresses) {
  if (!addresses || addresses.length === 0) return null;

  const sorted = [...addresses].sort((a, b) => {
    // Prefer last-used
    if (a.lastUsedAt && b.lastUsedAt) {
      return new Date(b.lastUsedAt) - new Date(a.lastUsedAt);
    }
    if (a.lastUsedAt) return -1;
    if (b.lastUsedAt) return 1;

    // Prefer more complete addresses
    const completenessA = [a.line1, a.line2, a.city, a.state, a.pinCode]
      .filter(Boolean).length;
    const completenessB = [b.line1, b.line2, b.city, b.state, b.pinCode]
      .filter(Boolean).length;

    return completenessB - completenessA;
  });

  return sorted[0];
}

/**
 * Format a saved address object for display in the autofill dropdown.
 *
 * @param {Object} address
 * @returns {string}
 */
function formatAddressLabel(address) {
  const parts = [
    address.line1,
    address.line2,
    address.city,
    address.state,
    address.pinCode,
  ].filter(Boolean);

  return parts.join(', ');
}

module.exports = {
  fetchUserAddresses,
  selectBestAddress,
  formatAddressLabel,
};
