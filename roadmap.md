# Stripe removal

- [x] Remove checkout, webhook and Stripe packages from the application.
- [x] Disable purchase controls while preserving accounts and existing credits.
- [x] Verify the application no longer invokes Stripe (signed-in pricing checked; three disabled purchase buttons, zero Stripe requests, removed webhook returns 404; test passed and build OK).
- [x] Disconnect managed Stripe in Payments (owner confirmed disconnect).

# Built-in payments

- [ ] Correct test catalog amounts to match the existing plans (129 NOK, 299 NOK, 1490 NOK/month); pending payment price-change approval.
- [ ] Verify checkout after catalog correction.
- [x] Add KM TECH LABS IP ownership and Paddle Merchant-of-Record disclosure to Norwegian and English terms; both checked in the signed-in preview, build OK.