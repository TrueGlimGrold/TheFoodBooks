# Testing

## Acceptance testing (primary)

Tests are not considered **passed** until the user has confirmed a **visible change on the live Vercel-hosted site**.

Local tests (e.g., `npm test`) and SQL verification queries are useful pre-checks, but they do not replace the Vercel acceptance check.

## Vercel acceptance checklist (current MVP)

1. Open the live Vercel site.
2. Confirm the **Version** stamp loads (from `public/version.json`).
3. Confirm the **Ingredients** section renders a grid of ingredients from Supabase.
4. Confirm the status pill shows `ok (N)` and the list matches seeded DB rows.
5. (Admin) Sign in and verify **New ingredient / Edit / Delete** cause visible changes in the grid after refresh.

