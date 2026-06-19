-- Seed data for local/demo testing
-- Run manually against your Supabase project to test verification.
--
-- codigo is omitted on purpose: the trg_set_certificate_code trigger
-- auto-generates a unique CBHE-{10 chars} value on INSERT.
-- Re-running this seed creates a new row each time (no UNIQUE collision).

INSERT INTO public.certificados (
  empresa_nombre,
  tipo_certificacion,
  fecha_emision,
  fecha_vencimiento,
  estado
) VALUES (
  'Petrobolivia S.A.',
  'ISO 9001 — Gestión de Calidad',
  '2026-01-15',
  '2027-01-15',
  'vigente'
);
