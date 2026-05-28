-- Seed data for local/demo testing
-- Run manually against your Supabase project to test verification

INSERT INTO public.certificados (
  codigo,
  empresa_nombre,
  tipo_certificacion,
  fecha_emision,
  fecha_vencimiento,
  estado
) VALUES (
  'CBHE-DEMO001',
  'Petrobolivia S.A.',
  'ISO 9001 — Gestión de Calidad',
  '2026-01-15',
  '2027-01-15',
  'vigente'
);
