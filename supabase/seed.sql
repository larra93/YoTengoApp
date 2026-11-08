insert into public.categories (name, slug, icon, sort_order)
values
  ('Disfraces', 'disfraces', 'shirt-outline', 1),
  ('Herramientas', 'herramientas', 'construct-outline', 2),
  ('Libros', 'libros', 'book-outline', 3),
  ('Juegos', 'juegos', 'game-controller-outline', 4),
  ('Deportes', 'deportes', 'basketball-outline', 5),
  ('Fiestas', 'fiestas', 'sparkles-outline', 6),
  ('Hogar', 'hogar', 'home-outline', 7),
  ('Música', 'musica', 'musical-notes-outline', 8)
on conflict (slug) do update
set
  name = excluded.name,
  icon = excluded.icon,
  sort_order = excluded.sort_order;
