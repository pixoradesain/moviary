-- Migration: add storage_locations column to films
-- Add a nullable text[] column to store one or more storage location identifiers (e.g. Terabox accounts/paths)
-- Run this SQL in your Supabase SQL editor or apply via your migrations tool (supabase CLI / psql)

ALTER TABLE IF EXISTS public.films
ADD COLUMN IF NOT EXISTS storage_locations text[];

-- Optionally initialize existing rows with an empty array instead of NULL
-- UPDATE public.films SET storage_locations = '{}'::text[] WHERE storage_locations IS NULL;

-- You can also add a comment for clarity
COMMENT ON COLUMN public.films.storage_locations IS 'Array of storage location identifiers (e.g. external account or path)';
