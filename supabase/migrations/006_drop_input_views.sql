-- Migration: 006_drop_input_views
-- Description: Drop the capacitacion_input and sello_input views.
--              Supabase Studio does not offer insert action on views, only
--              on tables. The views were created in migration 003 to hide
--              technical fields (id, codigo, qr_url, created_at) from
--              non-technical operators, but Studio cannot INSERT into a
--              view, so the views were unused and confusing.
--              Operators now insert directly into the base tables and
--              leave the technical fields blank — they are auto-populated
--              by triggers and the Edge Function.
-- Target: live DB after migration 005.
-- Change: auto-qr-generation

DROP VIEW IF EXISTS public.capacitacion_input;
DROP VIEW IF EXISTS public.sello_input;
