-- Migration: 003_split_certificados
-- Description: Split certificados into capacitacion + sello tables,
--              rename sello-cbhe → sello, add auto-code triggers,
--              explicit GRANTs, and drop orphan 002 functions.
-- Capabilities: cert-split-storage, cert-split-verification
--
-- IDEMPOTENT: re-running produces no errors and no state changes.
-- All statements use IF EXISTS / IF NOT EXISTS / OR REPLACE guards.
-- Target: live DB (2026-07-06) with capacitacion + sello-cbhe already present.

-- ============================================================
-- 1. Defensive: drop legacy certificados table (already gone in live DB)
-- ============================================================
DROP TABLE IF EXISTS public.certificados CASCADE;

-- ============================================================
-- 2. Rename sello-cbhe → sello (decided: hyphen is friction everywhere)
--    IF EXISTS ensures idempotency on re-run.
--    NOTE: IRREVERSIBLE once applied. Accepted decision 6 jul 2026.
-- ============================================================
ALTER TABLE IF EXISTS public."sello-cbhe" RENAME TO sello;

-- ============================================================
-- 3. pgcrypto extension (trusted, enabled by default in Supabase)
--    Provides gen_random_bytes() for cryptographic entropy.
--    Idempotent: IF NOT EXISTS is a no-op on re-run.
-- ============================================================
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================================
-- 4. Function: generate_capacitacion_code()
--    Returns a unique CBHE-C-{10 alphanumeric chars} code.
--    Mirrors 002 pattern but with the CBHE-C- prefix and
--    collision check against public.capacitacion.
-- ============================================================
CREATE OR REPLACE FUNCTION public.generate_capacitacion_code()
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  new_code text;
  chars text := 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  bytes bytea;
  i integer;
BEGIN
  LOOP
    bytes := gen_random_bytes(10);
    new_code := 'CBHE-C-';
    FOR i IN 0..9 LOOP
      new_code := new_code || substr(chars, (get_byte(bytes, i) % 62) + 1, 1);
    END LOOP;
    EXIT WHEN NOT EXISTS (
      SELECT 1 FROM public.capacitacion WHERE codigo = new_code
    );
  END LOOP;
  RETURN new_code;
END;
$$;

-- ============================================================
-- 5. Function: generate_sello_code()
--    Returns a unique CBHE-S-{10 alphanumeric chars} code.
--    Same pattern as generate_capacitacion_code() but with
--    the CBHE-S- prefix and collision check against public.sello.
-- ============================================================
CREATE OR REPLACE FUNCTION public.generate_sello_code()
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  new_code text;
  chars text := 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  bytes bytea;
  i integer;
BEGIN
  LOOP
    bytes := gen_random_bytes(10);
    new_code := 'CBHE-S-';
    FOR i IN 0..9 LOOP
      new_code := new_code || substr(chars, (get_byte(bytes, i) % 62) + 1, 1);
    END LOOP;
    EXIT WHEN NOT EXISTS (
      SELECT 1 FROM public.sello WHERE codigo = new_code
    );
  END LOOP;
  RETURN new_code;
END;
$$;

-- ============================================================
-- 6. Trigger function: set_capacitacion_code()
--    Fires BEFORE INSERT. Auto-generates codigo when NULL or empty.
--    Explicit codigo values are preserved (backward compatibility).
--    BEFORE triggers run before NOT NULL constraint checks,
--    so omitting the column or passing NULL is valid and gets filled here.
-- ============================================================
CREATE OR REPLACE FUNCTION public.set_capacitacion_code()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.codigo IS NULL OR NEW.codigo = '' THEN
    NEW.codigo := public.generate_capacitacion_code();
  END IF;
  RETURN NEW;
END;
$$;

-- ============================================================
-- 7. Trigger function: set_sello_code()
--    Same pattern as set_capacitacion_code(), calls generate_sello_code().
-- ============================================================
CREATE OR REPLACE FUNCTION public.set_sello_code()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.codigo IS NULL OR NEW.codigo = '' THEN
    NEW.codigo := public.generate_sello_code();
  END IF;
  RETURN NEW;
END;
$$;

-- ============================================================
-- 8. Defensive trigger drops (ensures clean re-bind on re-run)
--    trg_set_certificate_code: certificados table already dropped
--    in step 1 (CASCADE handles triggers). This DO block guards
--    against the edge case where the table doesn't exist.
-- ============================================================
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'certificados'
  ) THEN
    DROP TRIGGER IF EXISTS trg_set_certificate_code ON public.certificados;
  END IF;
END $$;

DROP TRIGGER IF EXISTS trg_set_capacitacion_code ON public.capacitacion;
DROP TRIGGER IF EXISTS trg_set_sello_code ON public.sello;

-- ============================================================
-- 9. Trigger bindings
-- ============================================================
CREATE TRIGGER trg_set_capacitacion_code
  BEFORE INSERT ON public.capacitacion
  FOR EACH ROW
  EXECUTE FUNCTION public.set_capacitacion_code();

CREATE TRIGGER trg_set_sello_code
  BEFORE INSERT ON public.sello
  FOR EACH ROW
  EXECUTE FUNCTION public.set_sello_code();

-- ============================================================
-- 10. GRANTs — explicit, idempotent, re-run safe
-- ============================================================
GRANT SELECT ON public.capacitacion TO anon;
GRANT SELECT ON public.sello TO anon;
GRANT ALL ON public.capacitacion TO service_role;
GRANT ALL ON public.sello TO service_role;

-- Defensive: ensure schema-level USAGE (needed if not already granted)
GRANT USAGE ON SCHEMA public TO anon, service_role;

-- ============================================================
-- 11. Orphan cleanup: drop functions from migration 002
--     These were bound to the certificados table (already gone).
--     CASCADE ensures any lingering trigger dependencies are cleaned.
-- ============================================================
DROP FUNCTION IF EXISTS public.generate_certificate_code() CASCADE;
DROP FUNCTION IF EXISTS public.set_certificate_code() CASCADE;
