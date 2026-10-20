/**
 * Paid checkouts are on whenever a payments client token is configured for the
 * build (VITE_PAYMENTS_CLIENT_TOKEN); without one the pricing page shows
 * "Coming soon" instead of buttons that cannot work.
 */
export const PURCHASES_ENABLED = Boolean(import.meta.env["VITE_PAYMENTS_CLIENT_TOKEN"]);

export const PURCHASES_UNAVAILABLE_MESSAGE = "Payments are not available yet.";
