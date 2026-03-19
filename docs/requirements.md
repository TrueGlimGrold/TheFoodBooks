# Requirements

Capture product and engineering requirements here. Keep them testable.

## Problem Statement

- People want a simple way to manage food data (ingredients and recipes), track inventory, and plan daily meals with a clear rollup of nutrients, calories, and cost.

## Goals

1. Admin can create and maintain a canonical ingredient database (price + nutrients).
2. Admin can create recipes from ingredients and see computed totals (nutrients + cost).
3. User can plan a day by selecting ingredients/recipes and see daily totals (nutrients + cost).
4. Inventory can be tracked and linked to ingredients and planned meals (MVP: basic quantities).

## Non-Goals

1. No automatic nutrient scraping or price fetching in production.
2. No barcode scanning or third-party integrations in MVP.
3. No multi-tenant teams/organizations in MVP unless explicitly requested.

## Target Users

1. Admin (site owner) entering and maintaining data.
2. End user (single-user scenario for MVP) viewing/planning meals from admin-entered data.

## Functional Requirements

1. Ingredients CRUD (admin-only writes): name, unit, price per unit, nutrient fields.
2. Recipes CRUD (admin-only writes): name, list of ingredient line items with quantities/units; compute totals.
3. Inventory CRUD (admin-only writes for MVP): ingredient quantities on hand.
4. Daily Meals: select a date and add ingredients/recipes with quantities/servings; show rollups for that day.
5. Data integrity: recipes reference existing ingredients; meals reference existing ingredients/recipes.

## Non-Functional Requirements

- Performance:
  - Keep client queries efficient (limit/select only needed columns).
- Accessibility:
  - Use semantic HTML; key flows should be keyboard navigable.
- SEO (if applicable):
  - Not a priority for MVP.
- Security/privacy:
  - Admin-only writes must be enforced by Supabase Auth + Postgres Row Level Security (RLS).
- Reliability:
  - Database constraints to prevent invalid references; no silent failures.

## Constraints & Assumptions

1. Stack is fixed unless the human explicitly approves a change:
   - Frontend: Vite + vanilla HTML/CSS/JavaScript
   - Hosting: Vercel
   - Database: Supabase Postgres (SQL) via `@supabase/supabase-js`
2. No custom server backend is planned for MVP; the browser talks directly to Supabase with the anon key, and RLS enforces security.
3. All production data is manually entered by the admin.

## Acceptance Criteria (MVP)

- Ingredients page lists ingredients from Supabase and the admin can add/edit/delete (admin-only).
- Recipes page lists recipes and shows computed totals from their ingredient line items.
- Meal Prep page can select a date and show daily totals for items added to that day.
- Inventory page shows on-hand quantities for ingredients.
