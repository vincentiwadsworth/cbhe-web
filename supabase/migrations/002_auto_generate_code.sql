-- Migration: 002_auto_generate_code
-- Description: Auto-generate certificate codes server-side via trigger
-- Capability: certification-storage (simplifies issuance, removes client-side collision logic)
--
-- Rationale: today the code is generated in scripts/issue-certificate.mjs using
-- crypto.randomBytes + a client-side codeExists() check. That logic belongs in the
-- database so any INSERT (script, Table Editor, future tooling) gets a unique code
-- without re-implementing collision handling. Backward compatible: an explicit
-- codigo passed in the INSERT is still respected.

-- ============================================================
-- pgcrypto extension (trusted, enabled by default in Supabase)
-- Provides gen_random_bytes() for cryptographic entropy.
-- ============================================================
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================================
-- Function: generate_certificate_code()
-- Returns a unique CBHE-{10 alphanumeric chars} code.
-- Uses gen_random_bytes (same entropy class as the previous
-- crypto.randomBytes approach). Loops until the generated code
-- does not collide with an existing row.
-- ============================================================
CREATE OR REPLACE FUNCTION public.generate_certificate_code()
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
    new_code := 'CBHE-';
    FOR i IN 0..9 LOOP
      new_code := new_code || substr(chars, (get_byte(bytes, i) % 62) + 1, 1);
    END LOOP;
    EXIT WHEN NOT EXISTS (
      SELECT 1 FROM public.certificados WHERE codigo = new_code
    );
  END LOOP;
  RETURN new_code;
END;
$$;

-- ============================================================
-- Trigger function: set_certificate_code()
-- Fires BEFORE INSERT. If codigo is NULL or empty, auto-generates it.
-- Explicit codigo values are preserved (backward compatibility).
-- Note: BEFORE triggers run before NOT NULL constraint checks,
-- so omitting the column or passing NULL is valid and gets filled here.
-- ============================================================
CREATE OR REPLACE FUNCTION public.set_certificate_code()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.codigo IS NULL OR NEW.codigo = '' THEN
    NEW.codigo := public.generate_certificate_code();
  END IF;
  RETURN NEW;
END;
$$;

-- ============================================================
-- Trigger binding
-- ============================================================
CREATE TRIGGER trg_set_certificate_code
  BEFORE INSERT ON public.certificados
  FOR EACH ROW
  EXECUTE FUNCTION public.set_certificate_code();
