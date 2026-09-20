# VolumCalc payments integration

## Goal
Add secure, embedded checkout to the existing pricing page while preserving the current free and contact-sales paths.

## Products
- Single estimate: 129 NOK, one-time purchase
- Three estimates: 299 NOK, one-time purchase
- Business: 1,490 NOK per month
- Free trial remains free and opens the upload flow
- Enterprise remains a contact/sign-in path

## Experience
- Paid pricing buttons open a polished checkout directly on the pricing page.
- Signed-in purchases are linked to the customer account; guests can pay with an email address.
- A return page confirms successful checkout and directs customers to continue.
- Preview clearly indicates test payments.
- Checkout uses end-to-end compliance handling for this Norwegian SaaS: tax calculation, collection, filing and remittance in supported markets, plus fraud, disputes, and transaction support. This adds 3.5% per transaction and may show `LINK.COM*` on bank statements.

## Technical details
- Use Lovable's built-in Stripe connection and embedded checkout only.
- Create stable test-catalog product and price identifiers with the SaaS tax code.
- Resolve or create a Stripe customer for authenticated users and attach their user ID.
- Use the managed gateway client; no private API keys enter source code.
- Add the checkout return route and route-specific metadata.
- Validate desktop and mobile checkout entry points and confirm the build is clean.

## Not included
- Credit enforcement after purchase and subscription-based feature gating require product rules for how credits are consumed, renewed, canceled, upgraded, and downgraded. This pass establishes payment collection without changing existing access rights.
