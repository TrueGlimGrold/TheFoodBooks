# Handoff

This file helps a new contributor (or future-you) pick up work quickly.

## Current State (as of 2026-03-19)

- Frontend is a Vite app deployed on Vercel (static hosting).
- App shows a build/version stamp from `public/version.json` (generated via `scripts/write-version.mjs`).
- Supabase is configured as the SQL backend (Postgres). Current code only includes a connectivity smoke test against the `healthcheck` table.

## Local Development

- OS: Windows (PowerShell)
- Commands:
  1. `npm install`
  2. Create `.env` from `.env.example` and fill in:
     - `VITE_SUPABASE_URL`
     - `VITE_SUPABASE_ANON_KEY`
  3. Run dev server: `npm run dev`
  4. Run smoke test: `npm test`

## Key Decisions

- Frontend: Vite + vanilla HTML/CSS/JS.
- Hosting: Vercel.
- Database: Supabase Postgres (SQL) accessed from the browser via `@supabase/supabase-js` with RLS for security.

## Known Gaps / Risks

- No `README.md` yet
- Only Ingredients schema + RLS is defined; Recipes/Meal Plans/Inventory are not yet implemented.
- Admin-only writes require Auth + RLS planning (don’t rely on “hiding” keys in the frontend).

## Next Conversation Notes

- Define the initial Supabase schema and the admin-only write model (Auth + RLS).
- Implement the first data-backed page (Ingredients) after schema is in place.

## Supabase SQL Backend Plan (MVP)

## 2026-03-19 14:39 (America/Edmonton) - Codex
- Date: 2026-03-19
- Changes (ordered list):
1. Provided exact Supabase SQL Editor commands to create `public.admins` + `public.ingredients` with RLS policies, then seed `public.ingredients`.
2. Provided verification queries to confirm tables/policies exist and seed data is present.
- Tests Requested from User:
1. Run `select to_regclass('public.ingredients'), to_regclass('public.admins');` and confirm both are non-null.
2. Run `select count(*) as ingredient_count from public.ingredients;` and confirm it returns `6` after seeding.
3. Run `select name, unit from public.ingredients order by name;` and confirm it lists the seeded ingredient names.
- Expected Test Output and Why:
- Both `to_regclass` values should be non-null because the tables are created in step 1.
- `ingredient_count` should be `6` because the seed script inserts 6 rows and uses `on conflict ... do nothing` to avoid duplicates.
- User Test Result: Pass
- Frontend Requests:
1. Ensure Vercel project environment variables include `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`, then redeploy so the hosted app reads the populated database.
- Next Step:
- Confirm the SQL tests pass, then validate the hosted Vercel app can read and display ingredients from Supabase.

Principles:
- All real data entry is performed by an admin user (no auto-generation outside of testing).
- The frontend uses the Supabase anon key; security is enforced with Postgres + RLS.

Tables (proposed):
1. `ingredients`
   - Core fields: `id`, `name`, `unit`, `price_per_unit`
   - Nutrients: start with explicit columns for the basics (e.g., `calories`, `protein_g`, `carbs_g`, `fat_g`, `fiber_g`, `sodium_mg`) and extend as needed.
2. `recipes`
   - `id`, `name`, `notes`
3. `recipe_items`
   - `recipe_id`, `ingredient_id`, `quantity`, `unit`
   - Optional: `serving_category` (or a FK to a `serving_categories` table) to support “1 serving vegetables”, “1 serving nuts”, etc.
4. `meal_days`
   - `id`, `date` (unique), `notes`
5. `meal_entries`
   - `meal_day_id`
   - Either `ingredient_id` or `recipe_id` (enforced with a check constraint)
   - `quantity`/`servings`
6. `inventory_items`
   - `ingredient_id`, `quantity`, `unit`, `updated_at`

Rollups (proposed):
- Start with SQL views:
  - `recipe_totals` (cost + nutrient totals per recipe; optionally per serving)
  - `meal_day_totals` (cost + nutrient totals per day)
- If needed later: add Postgres functions (RPC) for heavier calculations or validation.

Security (RLS) (proposed):
- Create an `admins` allowlist table keyed by `auth.uid()` (or a `profiles.role` pattern).
- Policies:
  - `SELECT`: allow everyone (or only authenticated users if we decide to require login).
  - `INSERT/UPDATE/DELETE`: allow only admins.

Deployment notes:
- Vercel project env vars must include `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.

## 2026-03-19 13:49 (America/Edmonton) - Codex
- Date: 2026-03-19
- Changes (ordered list):
1. Updated `docs/handoff.md` to reflect the current Vite + Vercel + Supabase setup.
2. Drafted an MVP Supabase SQL schema + RLS approach for Ingredients/Recipes/Meal Plans/Inventory.
- Tests Requested from User:
1. Run `npm test` locally (verifies `public/version.json` is generated and parseable).
2. Run `npm run dev`, open the app, and confirm the Version loads (not “unavailable”).
- Expected Test Output and Why:
  - `npm test` prints `ok smoke-test` with a `builtAt` timestamp because the pretest step generates `public/version.json`.
  - The app shows `Version: <commit> (<builtAt>)` because `src/main.js` fetches `/version.json` and renders it.
- User Test Result: Pending/Pass/Fail
- Frontend Requests:
1. None.
- Next Step:
  - Create the Supabase tables + RLS policies (admin-only writes) and update the app to read Ingredients from Supabase.

## 2026-03-19 14:01 (America/Edmonton) - Codex
- Date: 2026-03-19
- Changes (ordered list):
1. Updated `docs/requirements.md` to define The Food Books scope and lock the selected stack (Vercel + Vite + vanilla JS + Supabase Postgres) unless explicitly approved to change.
2. Updated `docs/tasks.md` to reflect the current stack choice and the next backend milestones (Supabase schema/RLS, then Ingredients page).
3. Added an explicit "do not deviate from selected stack" note in `AGENTS.md`.
- Tests Requested from User:
1. None (docs-only change).
- Expected Test Output and Why:
  - N/A (no runtime changes).
- User Test Result: Pending
- Frontend Requests:
1. None.
- Next Step:
  - Implement the Supabase SQL schema (tables + constraints) for Ingredients first, then wire the Ingredients page to read from Supabase.

## 2026-03-19 14:07 (America/Edmonton) - Codex
- Date: 2026-03-19
- Changes (ordered list):
1. Added Supabase SQL schema + RLS for Ingredients in `docs/supabase/ingredients.sql` (includes `public.admins` allowlist for admin-only writes).
2. Added dev/test seed data in `docs/supabase/seed-ingredients.sql`.
3. Replaced the smoke-test UI with an Ingredients list page (grid) with New/Edit/Delete actions and an Admin sign-in section in `src/main.js`.
4. Updated `src/supabase/testSupabase.js` to test the `ingredients` table (instead of `healthcheck`).
5. Added minimal CSS for grid cards and auth inputs in `src/style.css`.
- Tests Requested from User:
1. In Supabase SQL editor, run `docs/supabase/ingredients.sql`, then `docs/supabase/seed-ingredients.sql`.
2. In Supabase Auth, create an admin user (email/password), then insert their UID into `public.admins` (SQL below).
3. Set `.env` values for `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
4. Run `npm run dev`, open the site, and verify the Ingredients grid loads seed items.
5. Sign in as admin and verify New/Edit/Delete succeed (and fail when signed out).
- Expected Test Output and Why:
  - Grid shows 6 seed ingredients because `refreshIngredients()` queries `public.ingredients` and the seed file inserts 6 rows.
  - When signed out, New/Edit/Delete should error due to RLS `ingredients_write_admin_only`.
  - When signed in as an allowlisted admin, New/Edit/Delete should succeed because the policy checks `public.admins` against `auth.uid()`.
- User Test Result: Pending
- Frontend Requests:
1. None (this page is the requested UI for Ingredients).
- Next Step:
  - Once confirmed working, define recipe tables (`recipes`, `recipe_items`) and build the Recipes page.

## 2026-03-19 14:46 (America/Edmonton) - Codex
- Date: 2026-03-19
- Changes (ordered list):
1. Added `docs/testing.md` documenting that tests are only considered passed after a visible change is confirmed on the live Vercel site.
- Tests Requested from User:
1. Open the live Vercel site and confirm the Ingredients grid renders and shows the seeded ingredients.
2. Sign in as the admin user and confirm New/Edit/Delete create a visible change in the grid (and that signed-out writes fail).
- Expected Test Output and Why:
  - The Ingredients grid should load because the DB is seeded and reads are allowed to `anon`/`authenticated`.
  - Writes should only succeed when signed in as an allowlisted admin due to RLS policies.
- User Test Result: Pending
- Frontend Requests:
1. Ensure Vercel Production env vars `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set, then redeploy so the hosted build points at the populated Supabase project.
- Next Step:
  - Once Vercel visibly shows ingredients, decide whether to keep Ingredients on the home page or add a dedicated `/ingredients` route + navigation.
