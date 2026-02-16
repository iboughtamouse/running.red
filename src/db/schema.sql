-- Running Red: Initial Schema
-- See docs/CONTENT_MODEL.md for field details

-- Comic pages (collection)
CREATE TABLE comic_pages (
  id SERIAL PRIMARY KEY,
  page_number INTEGER UNIQUE NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  title VARCHAR(255),
  image_url VARCHAR(500) NOT NULL,
  image_mobile_url VARCHAR(500),
  image_blur_hash TEXT,
  commentary TEXT,
  content_warnings TEXT[] DEFAULT '{}',
  content_warning_other TEXT,
  publish_date TIMESTAMPTZ NOT NULL,  -- Always stored as 12:00 UTC on the chosen date
  status VARCHAR(20) DEFAULT 'draft',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_comic_pages_status ON comic_pages(status);
CREATE INDEX idx_comic_pages_publish_date ON comic_pages(publish_date);
CREATE INDEX idx_comic_pages_page_number ON comic_pages(page_number);

-- About page (singleton)
CREATE TABLE about_page (
  id SERIAL PRIMARY KEY,
  about_me TEXT NOT NULL,
  about_comic TEXT NOT NULL,
  content_warnings TEXT NOT NULL,
  update_schedule VARCHAR(255) NOT NULL DEFAULT 'Updates Mondays'
);

CREATE UNIQUE INDEX idx_about_page_singleton ON about_page ((1));

-- Links page (singleton)
CREATE TABLE links_page (
  id SERIAL PRIMARY KEY,
  links JSONB NOT NULL DEFAULT '[]'::jsonb
);

CREATE UNIQUE INDEX idx_links_page_singleton ON links_page ((1));

-- Site settings (singleton)
CREATE TABLE site_settings (
  id SERIAL PRIMARY KEY,
  site_title VARCHAR(255) NOT NULL DEFAULT 'Running Red',
  site_description TEXT NOT NULL DEFAULT 'A webcomic by Ren',
  social_image_url VARCHAR(500)
);

CREATE UNIQUE INDEX idx_site_settings_singleton ON site_settings ((1));
