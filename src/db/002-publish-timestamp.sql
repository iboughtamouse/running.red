-- Migration: Change publish_date from DATE to TIMESTAMPTZ
-- Comics now publish at 12:00 UTC on the selected date
-- Existing DATE values are converted to 12:00 UTC on that date

ALTER TABLE comic_pages
  ALTER COLUMN publish_date TYPE TIMESTAMPTZ
  USING publish_date::timestamptz + interval '12 hours';
