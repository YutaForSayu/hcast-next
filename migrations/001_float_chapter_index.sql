-- Migration: change chapter_index columns from integer to real (float4)
-- to support decimal chapter numbers like 29.1, 12.5, 0.5
--
-- Run this ONCE against the production database:
--   psql $DATABASE_URL -f migrations/001_float_chapter_index.sql

-- comments table
ALTER TABLE comments
  ALTER COLUMN chapter_index TYPE real USING chapter_index::real;

-- series_reactions table
ALTER TABLE series_reactions
  ALTER COLUMN chapter_index TYPE real USING chapter_index::real;

-- read_history table
ALTER TABLE read_history
  ALTER COLUMN chapter_index TYPE real USING chapter_index::real;
