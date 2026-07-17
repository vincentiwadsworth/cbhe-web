-- Migration: 007_add_fecha_expiracion
-- Description: Add optional expiration date to certificado tables
-- Capabilities: cert-expiration
--
-- IDEMPOTENT: re-running produces no errors and no state changes.
-- All statements use IF NOT EXISTS guards.

ALTER TABLE public.capacitacion
  ADD COLUMN IF NOT EXISTS fecha_expiracion date NULL;

ALTER TABLE public.sello
  ADD COLUMN IF NOT EXISTS fecha_expiracion date NULL;
