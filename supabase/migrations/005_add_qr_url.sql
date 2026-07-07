-- Migration: 005_add_qr_url
-- Description: Add qr_url column to capacitacion + sello tables
--              for auto-generated QR code verification URLs.
-- Capabilities: cert-split-storage, auto-qr-pipeline
--
-- IDEMPOTENT: uses ADD COLUMN IF NOT EXISTS. Safe to re-run.
-- Re-running produces no errors and no state changes.
-- Existing rows default to NULL (no backfill required).
-- Target: live DB after migration 004.

-- ============================================================
-- 1. Add qr_url to public.capacitacion
-- ============================================================
ALTER TABLE IF EXISTS public.capacitacion
  ADD COLUMN IF NOT EXISTS qr_url text DEFAULT NULL;

-- ============================================================
-- 2. Add qr_url to public.sello
-- ============================================================
ALTER TABLE IF EXISTS public.sello
  ADD COLUMN IF NOT EXISTS qr_url text DEFAULT NULL;
