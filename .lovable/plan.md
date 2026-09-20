# VolumCalc application update

## Brand and visual system
- Replace every customer-facing CubicCalc reference with **VolumCalc**, including page titles, social metadata, auth screens, dashboard, print/PDF output, and translated copy.
- Add `volumcalc.com` where the product domain is shown and remove leftover Lovable social branding.
- Create a reusable geometric volume-mark + VolumCalc wordmark in the selected **Premium geometric minimalist** direction, with light/dark-safe variants, a compact icon, favicon, and print branding.
- Refine the full application with cleaner spacing, sharper cards, restrained soft-blue surfaces, premium shadows, and consistent brand treatments while preserving the current layouts and workflows.

## Automatic room grouping
- Add room records to each estimate and connect every detected item to a room.
- Extend photo analysis to return a normalized room name for each item from the requested room list, while preserving item detection, dimensions, confidence, and totals.
- Save the AI-created rooms during upload and show results grouped by room with room subtotals.
- Let signed-in company users rename rooms and move items between rooms using clear inline controls.
- Keep older estimates compatible by placing unassigned items in an “Other” group.
- Tighten item and room editing permissions so signed-in companies cannot alter another company’s estimates.

## Upload guidance
- Add the supplied 1–3 photos-per-room guidance prominently above the photo picker in Norwegian and English.
- Raise the calculation limit from 12 to 15 photos consistently in the page, image validation, and AI request.
- Keep the existing upload, compression, progress, storage, and results navigation behavior.

## Private and business pricing
- Rework pricing into two unmistakable paths: **Private individuals** and **Moving companies**.
- Show private options exactly as requested: one calculation for 129 NOK, three for 299 NOK, and one free trial calculation limited to six photos.
- Preserve the existing moving-company plans and calls to action.
- This update will present the offers and direct users into the existing calculation/account flows; payment checkout is not added because no payment workflow was requested.

## Email, metadata, and quality checks
- Apply the VolumCalc name and `volumcalc.com` to app-managed authentication email templates where supported.
- Give every content page complete, unique VolumCalc metadata, including social sharing fields.
- Verify the migration and permissions, run the database security checks, test the AI request contract, and validate the main pages and room editing flow on desktop and mobile.
