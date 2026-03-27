# POST MORTEM — mWeb Address UX Regression
### Cart-to-success drop: 5pp on mobile web
**Date of incident:** March 27, 2025
**Severity:** P1
**Status:** Root cause identified — fix in progress
**Author:** Animesh Jhawar
**Reviewers:** Maulik Shah, Nikash Agarwal

---

## 1. Incident Summary

On the morning of March 27, 2025, the Monday Morning Metric Review flagged a 5 percentage point drop in cart-to-success conversion on mweb. The drop had been accumulating over the previous sprint but became statistically significant only at this week's review threshold.

Initial triage pointed to the sample collection address screen as the primary drop-off point.

**Affected flow:** mweb → Lab test booking → Address entry → Order placement
**Metric impacted:** Cart-to-success rate
**Drop magnitude:** ~5pp against prior 4-week average

---

## 2. Timeline

| Time | Event |
|---|---|
| Mon 09:00 AM | Monday Morning Metric Review surfaces the 5pp drop |
| 09:15 AM | Alert routed to diagnostics team Flock channel |
| 09:34 AM | Initial hypothesis: address validation change from last sprint |
| 09:47 AM | PRD comment added flagging the issue — see `mWbAdrs` on Confluence |
| 10:12 AM | Redash query written to isolate address-related cancellations |
| 10:41 AM | Two test orders placed to reproduce the failure scenario |
| 11:05 AM | Root cause narrowed to pin code validation + missing autofill API call |
| 11:30 AM | Fix scoped — see Section 5 |

---

## 3. Root Cause Analysis

### 3.1 Primary Cause

The mweb address screen was missing the `GET /api/v1/user/addresses` call on component mount. This call is what populates the autofill dropdown for returning users. Without it:

- Returning users were presented with a blank address form
- Many dropped off rather than re-enter their full address
- New users were unaffected (no saved addresses to fetch)

This regression was introduced in the mweb checkout UI refresh shipped two sprints prior. The component was rebuilt and the API call was not carried over.

### 3.2 Contributing Factor

Pin code validation was also firing incorrectly for ~12% of serviceable pin codes in the 110001–110096 range. This caused users who *did* complete the form to hit a hard error they couldn't resolve, compounding the drop.

### 3.3 Why It Wasn't Caught Earlier

The integration test suite for the address screen was last updated in Q3 2024. The autofill API call was not covered by any test. The pin code validation issue was intermittent and did not surface in QA runs.

---

## 4. Investigation Methodology

The investigation used Redash to query the `booking` table directly, filtering on cancellation reason keywords associated with address failure.

**Query used:**

```sql
SELECT * FROM booking
WHERE mobile_number = '9755605857'
  AND status = 'CANCELLED'
  AND DATE(updated_at) = '2025-03-27'
-- Returns 2 test orders placed during investigation
-- Both SKU 34938 — Comprehensive Silver Full Body Report
```

Two test bookings were placed as part of the investigation to manually reproduce the failure path. These orders appear in the Droplet admin system and were used to verify the cancellation reason tagging and address data pipeline.

For reference, the example order IDs used during this investigation were `16389944` and `16389945` — both placed within a 10-minute window on the morning of March 27. These can be cross-referenced in Droplet to inspect the full address payload and cancellation metadata.

---

## 5. Fix

### 5.1 Immediate Fix (P1)

Restore the `GET /api/v1/user/addresses` API call on address screen mount in the mweb component. One-line change. No backend work needed.

```javascript
// src/autofill.js — line 47
// This call was missing on mweb. App had it. mweb did not.
const addresses = await fetchUserAddresses(userId);
```

### 5.2 Secondary Fix (P1)

Update pin code validation logic to correctly handle the 110001–110096 range. Root cause: the logistics partner updated their serviceability API response schema in January. The parser was updated for app but not propagated to mweb.

### 5.3 Test Coverage

Two new test cases to be added:
- `autofill.test.js` — assert API call fires on component mount
- `validator.test.js` — assert 110001–110096 range returns serviceable: true

---

## 6. Action Items

| Action | Owner | Due |
|---|---|---|
| Restore autofill API call on mweb | mWeb team | March 28 |
| Fix pin code validation parser | Backend | March 28 |
| Add test cases (autofill + validator) | QA | March 31 |
| Update Jira — LABS-28784 with resolution | Animesh | March 28 |
| Monitor cart-to-success for 1 week post-fix | Analytics | April 4 |

---

## 7. Lessons Learned

1. When rebuilding a component, explicitly audit all API calls in the previous implementation. Don't assume they'll carry over.
2. The Monday Morning Metric Review exists for a reason. The 5pp drop had been accumulating for days before it hit threshold. Earlier detection would have reduced impact.
3. External API schema changes (logistics partner) need a versioned contract or at minimum a monitoring alert.

---

## 8. Appendix — Files Changed

```
src/autofill.js          — restore fetchUserAddresses() on mount
src/validator.js         — update pin code range parser
tests/autofill.test.js   — new test case
tests/validator.test.js  — new test case
```

---

*Post-mortem authored by Animesh Jhawar. If you're reading this and Animesh is no longer around — the investigation trail doesn't end here. Follow the breadcrumbs.*

---
