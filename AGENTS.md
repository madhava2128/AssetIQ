# AGENTS.md — Agent & Engineering Guidelines for AssetIQ

This file defines the standing rules and instructions for all autonomous AI agents and engineers operating on AssetIQ.

See the full documentation in [docs/engineering-rules.md](file:///Users/madhava/Desktop/AssetIQ/docs/engineering-rules.md).

## Standing Engineering Rules

1. **Mandatory Verification**: Any change that touches surgeries, roles, authentication, RLS policies, caching, or the Supabase client setup must run `npm run verify:surgery-flow` and show all checks passing (22/22) before the task is reported complete.
2. **Confirm Before Claiming Success**: Every database write must check the returned error and must never show success until the database confirms it. Never use client-side optimistic UI for unconfirmed data. Keep entered form data intact on error.
3. **Atomic Multi-Table Writes**: Multi-table writes must be atomic via a single database function/RPC inside a single ACID transaction (`public.schedule_surgery_with_required_assets(...)`), never a chain of separate inserts. Zero partial rows on error.
4. **Shared Read Path**: Lists and dashboards must use the shared read functions (`getSharedSurgeries` and `apps/web/lib/surgeries-shared.ts`), never their own hand-crafted copies of the query. Use `LEFT JOIN` / `LEFT JOIN LATERAL` so unassessed surgeries cleanly show "NOT_CHECKED" ("Not yet checked"). Standardize all dates to `Asia/Kolkata`. Auto-refresh every 60s and on window focus.
5. **No Loosened Policies**: Never loosen RLS policies to hide a bug. Maintain the strict permission matrix (readiness_assessments is read-only for all roles; surgeries is writable only by ot_admin and hospital_admin; assets is writable only by biomedical_engineer and hospital_admin; readiness_config is restricted to hospital_admin).
6. **Key Isolation**: Keep service-role keys strictly out of app code, API routes, and the browser. Run authenticated queries with the caller's session role claims (`request.jwt.claims`).
