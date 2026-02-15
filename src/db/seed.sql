-- Running Red: Seed Data
-- Default rows for singleton tables

INSERT INTO site_settings (site_title, site_description)
VALUES ('Running Red', 'A webcomic by Ren');

INSERT INTO about_page (about_me, about_comic, content_warnings, update_schedule)
VALUES (
  'I''m Ren, the creator of Running Red.',
  'Running Red is a story about Alexandrus.',
  'This comic contains sensitive themes.',
  'Updates Mondays'
);

INSERT INTO links_page (links)
VALUES ('[]'::jsonb);
