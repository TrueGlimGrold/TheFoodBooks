# Repository Guidelines

## Project Overview
This repository is a food tracking website called **The Food Books**. It helps an admin manage Ingredients and Recipes, and helps a user plan meals by day and see rollups for nutrients, calories, and pricing.

All production data should be **entered by the admin**. Nothing should be automatically generated except in explicit testing utilities.

## Project Structure
- `index.html`: App entry (Vite).
- `src/`: Client code (vanilla HTML/CSS/JS via Vite).
- `public/`: Static assets and generated `version.json`.
- `scripts/`: Small build/test utilities (e.g., `write-version.mjs`).
- `docs/`: Requirements, tasks backlog, and the required handoff log (`docs/handoff.md`).

Ignore generated folders when reviewing changes: `node_modules/`, `.vercel/`, `.vs/`.

## Build, Test, and Development Commands
From repo root:

```powershell
npm install
npm run dev
npm run build
npm run preview
npm test
```

Environment:
- Copy `.env.example` → `.env` and set:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`

## Backend / Database
- SQL database is Supabase Postgres.
- Client uses `@supabase/supabase-js` from the browser; do not put secrets in the frontend.
- Security must be enforced via Postgres constraints + **Row Level Security (RLS)**.
- Do not deviate from the selected stack (Vercel + Vite + vanilla JS + Supabase) unless the human explicitly approves it.

## Coding Style
- JavaScript ESM (`type: module`).
- Keep changes small and testable.
- Match existing formatting (2-space indentation in JS/CSS in this repo).

## Backend Collaboration Rules (User-Provided)
You (Codex) handle backend/data work; the human handles UI/layout.

- Do not create new UI components or change UI layout/styling without asking the human.
- Backend work that requires UI hookup must be written as a request in `docs/handoff.md` under **Frontend Requests**.

## Required Handoff Process
Always keep `docs/handoff.md` up to date as the project progresses.

Every backend session must append an entry using this template:

```md
## YYYY-MM-DD HH:MM (Timezone) - Agent Name
- Date:
- Changes (ordered list):
1.
2.
- Tests Requested from User:
1.
2.
- Expected Test Output and Why:
- User Test Result: Pending/Pass/Fail
- Frontend Requests:
1.
2.
- Next Step:
```

Definition of Done for a backend task:
1. Backend code changes are complete.
2. Build/compile succeeds with no new errors.
3. Test steps are given to the user with expected results.
4. User confirms tests pass.
5. Handoff entry is updated in `docs/handoff.md`.

## Work Breakdown Expectation
Before working towards an outcome, break the task into the smallest testable pieces possible and do not build the next piece until the previous one is confirmed working by the user.
