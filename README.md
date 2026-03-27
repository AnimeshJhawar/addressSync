# addressSync

> **Internal utility — Diagnostics Vertical, Tata 1MG**
> Sync layer between mWeb address collection UI and the booking service backend.

---

## Overview

`addressSync` is a lightweight service responsible for validating, normalising, and persisting sample collection addresses entered during the lab test booking flow on mobile web.

It sits between the mWeb frontend and the core booking service, handling:

- Pin code serviceability checks (via logistics partner API)
- Address field normalisation (trimming, casing, special character stripping)
- Saved address autofill hydration for returning users
- Fallback address resolution when the primary address fails validation

---

## Why does this exist?

The original booking service handled address logic inline. As the diagnostics vertical scaled, address-related failures became one of the top three cancellation reasons. Rather than patch the monolith repeatedly, this sync layer was extracted in Q3 2024 to centralise all address concern logic in one place.

> See PRD: `mWbAdrs` on Confluence — DX Diagnostics space.

---

## Setup

```bash
git clone https://github.com/AnimeshJhawar/addressSync.git
cd addressSync
npm install
cp .env.example .env
# Fill in your local values — never commit .env
npm run dev
```

**Node version:** 18.x (use `.nvmrc`)
**Environment:** Runs locally against staging booking service by default.

---

## Project Structure

```
addressSync/
├── src/
│   ├── index.js              # Entry point
│   ├── validator.js          # Pin code + field validation logic
│   ├── normaliser.js         # Address string cleaning
│   ├── autofill.js           # Saved address hydration
│   └── upload_config.js      # Gumlet image upload config (legacy, kept for ref)
├── scripts/
│   └── investigate.js        # Debug utility — do not run in prod
├── tests/
│   ├── validator.test.js
│   ├── normaliser.test.js
│   └── autofill.test.js
├── POST_MORTEM.md            # Q1 2025 incident report — address drop investigation
├── .env.example
├── .nvmrc
└── package.json
```

---

## Key Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start local dev server |
| `npm test` | Run test suite |
| `npm run validate` | Run pin code validation checks only |
| `npm run investigate` | Run the debug investigation script (staging only) |

---

## Incident History

| Date | Incident | Root Cause | Resolution |
|---|---|---|---|
| Oct 14, 2024 | Address autofill broken on app after deploy | Shared component import path changed | Hotfix in 2h |
| Jan 9, 2025 | Pin code validation rejecting valid codes | Logistics API updated their schema silently | Updated parser |
| **Mar 27, 2025** | **mweb cart-to-success drop 5pp** | **See POST_MORTEM.md** | **In progress** |

---

## Contributing

Raise a PR against `main`. Tag `@AnimeshJhawar` for review.
All commits must follow conventional commits format (`feat:`, `fix:`, `chore:` etc.)

---

## Contact

Animesh Jhawar — diagnostics backend lead
*Last active: March 27, 2025*
