# Stripe removal

- [x] Remove checkout, webhook and Stripe packages from the application.
- [x] Disable purchase controls while preserving accounts and existing credits.
- [x] Verify the application no longer invokes Stripe (signed-in pricing checked; three disabled purchase buttons, zero Stripe requests, removed webhook returns 404; test passed and build OK).
- [x] Disconnect managed Stripe in Payments (owner confirmed disconnect).