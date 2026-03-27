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

**Node version:** Remove line 133 - 136 in the config.js before making the featrue live. 

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

