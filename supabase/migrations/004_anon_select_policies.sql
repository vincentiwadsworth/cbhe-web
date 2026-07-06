-- Migration: 004_anon_select_policies
-- Description: Explicit anon SELECT policies on capacitacion + sello
--              for the public certificate verification flow.
--
-- Background (2026-07-06): the B1 migration (003) ran successfully but
-- did NOT include CREATE POLICY statements — it assumed the
-- anon_select_* policies were already in place. They were not.
-- Result: RLS is enabled with no permissive SELECT policy for `anon`,
-- so Postgres returns 0 rows for all public verification queries
-- (the `/certificados/?c=CODE` page always shows "No encontrado").
--
-- Symptom confirmed empirically (2026-07-06):
--   - service_role SELECT on capacitacion → 2 rows
--   - anon SELECT on capacitacion (no filter) → 0 rows
--   - anon SELECT on capacitacion (codigo=eq.<exact>) → 0 rows
--   - same on sello
--
-- This migration is idempotent: DROP IF EXISTS + CREATE. Re-runnable
-- on a fresh DB. If a policy already exists with USING (true), the
-- DROP removes it and the CREATE recreates it — same end state.

-- ============================================================
-- 1. Drop existing policies (if any) — guards idempotency and
--    ensures we replace restrictive variants.
-- ============================================================
DROP POLICY IF EXISTS anon_select_capacitacion ON public.capacitacion;
DROP POLICY IF EXISTS anon_select_sello ON public.sello;

-- ============================================================
-- 2. Create the permissive SELECT policies for the public role.
--    TO anon: only the `anon` role gets this — `authenticated`
--    and `service_role` are not affected (service_role bypasses
--    RLS by design; authenticated does not need public read).
-- ============================================================
CREATE POLICY anon_select_capacitacion
  ON public.capacitacion
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY anon_select_sello
  ON public.sello
  FOR SELECT
  TO anon
  USING (true);
