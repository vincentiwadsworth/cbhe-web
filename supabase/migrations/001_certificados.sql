-- Migration: 001_certificados
-- Description: Create certificados table for CBHE certificate verification system
-- Capabilities: certification-storage (FR-1, FR-2, FR-3)

-- ============================================================
-- Table: certificados
-- Stores digital certificates issued by CBHE for verification
-- ============================================================
CREATE TABLE public.certificados (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo text UNIQUE NOT NULL,
  empresa_nombre text NOT NULL,
  tipo_certificacion text NOT NULL,
  fecha_emision date NOT NULL,
  fecha_vencimiento date,
  estado text NOT NULL DEFAULT 'vigente'
    CHECK (estado IN ('vigente', 'vencido', 'revocado')),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Index for fast certificate code lookups (verification page)
CREATE INDEX idx_certificados_codigo ON public.certificados (codigo);

-- ============================================================
-- Row-Level Security
-- ============================================================
ALTER TABLE public.certificados ENABLE ROW LEVEL SECURITY;

-- Policy: anon can SELECT only vigente certificates
CREATE POLICY "anon_select_vigente" ON public.certificados
  FOR SELECT
  TO anon
  USING (estado = 'vigente');

-- Policy: authenticated can SELECT vigente certificates
CREATE POLICY "authenticated_select_vigente" ON public.certificados
  FOR SELECT
  TO authenticated
  USING (estado = 'vigente');

-- Policy: service_role has full CRUD
CREATE POLICY "service_role_full" ON public.certificados
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Grant SELECT to anon and authenticated roles (Data API exposure)
GRANT SELECT ON public.certificados TO anon;
GRANT SELECT ON public.certificados TO authenticated;
