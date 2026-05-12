-- Harmonize commercial copy for an accessories-only positioning.

insert into public.settings (key, value, updated_at) values
  ('site', jsonb_build_object(
    'name',        'SILVIO STORE',
    'tagline',     'Accessoires mobiles premium livrs dans toute la sous-rgion',
    'description', 'Coques, protections d''cran, chargeurs, cbles, couteurs et accessoires du quotidien. Paiement scuris et livraison rapide.',
    'phone',       '+228 00 00 00 00',
    'email',       'contact@silviostore.com',
    'address',     'Lom, Togo',
    'currency',    'XOF'
  ), now()),
  ('header_strip', jsonb_build_object(
    'enabled', true,
    'text',    'Accessoires mobiles premium - livraison sous-rgion'
  ), now()),
  ('home_hero', jsonb_build_object(
    'enabled',    true,
    'title',      'Tout pour proteger, charger et equiper votre mobile.',
    'subtitle',   'Decouvrez des accessoires fiables: coques, verres trempes, chargeurs, cbles, couteurs et supports. Qualit, style et prix justes.',
    'image_url',  '/placeholder-hero.svg',
    'badge_text', 'Accessoires uniquement',
    'cta_label',  'Explorer le catalogue',
    'cta_link',   '/catalogue',
    'cta2_label', 'Voir les nouveauts',
    'cta2_link',  '/cataloguetri=recent'
  ), now()),
  ('home_cta', jsonb_build_object(
    'enabled',  true,
    'title',    'Besoin d''un accessoire prcis ',
    'text',     'crivez-nous et nous vous aidons a trouver rapidement la bonne rfrence pour votre appareil.',
    'cta_label','Contacter un conseiller',
    'cta_link', '/contact'
  ), now())
on conflict (key) do update
set value = excluded.value,
    updated_at = now();

