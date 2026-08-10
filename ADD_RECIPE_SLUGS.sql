-- Migration: Add unique slug column to recipes table
-- Run this in your Supabase SQL Editor

-- 1. Add slug column if it does not exist
ALTER TABLE recipes ADD COLUMN IF NOT EXISTS slug TEXT;

-- 2. Backfill existing recipes with clean slugs from their title
UPDATE recipes
SET slug = TRIM(BOTH '-' FROM LOWER(
  REGEXP_REPLACE(
    REGEXP_REPLACE(
      REGEXP_REPLACE(
        TRIM(BOTH FROM title),
        '&', 'and', 'g'
      ),
      '[^a-zA-Z0-9\s-]', '', 'g'
    ),
    '[\s_-]+', '-', 'g'
  )
))
WHERE slug IS NULL OR slug = '';

-- 3. Set NOT NULL constraint
ALTER TABLE recipes ALTER COLUMN slug SET NOT NULL;

-- 4. Add UNIQUE constraint and index on slug
ALTER TABLE recipes DROP CONSTRAINT IF EXISTS recipes_slug_unique;
ALTER TABLE recipes ADD CONSTRAINT recipes_slug_unique UNIQUE (slug);

CREATE INDEX IF NOT EXISTS idx_recipes_slug ON recipes(slug);
