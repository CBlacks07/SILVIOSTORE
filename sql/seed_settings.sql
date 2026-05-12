-- SILVIO STORE - Valeurs par défaut pour settings/brands

insert into public.settings (key, value) values
  ('site', jsonb_build_object(
     'name',        'SILVIO STORE',
     'tagline',     'Accessoires premium Apple et plus encore, dans la sous région',
     'description', 'Pochettes haut de gamme, bracelets Apple, Apple Watch, coques et chargeurs de qualité. Livraison dans toute la sous région.',
     'phone',       '+228 00 00 00 00',
     'email',       'contact@silviostore.com',
     'address',     'Lomé, Togo',
     'currency',    'XOF'
  )),
  ('header_strip', jsonb_build_object(
     'enabled', true,
     'text',    'Accessoires premium livrés dans toute la sous région'
  )),
  ('home_hero', jsonb_build_object(
     'enabled',    true,
     'title',      'Accessoires premium pour Apple Watch, iPhone et votre quotidien.',
     'subtitle',   'Pochettes haut de gamme, bracelets Apple, Apple Watch, coques et chargeurs de qualité. Paiement sécurisé Mobile Money et carte, livraison sous région.',
     'image_url',  '/placeholder-hero.svg',
     'images',     '[]'::jsonb,
     'video_url',  '',
     'badge_text', 'Sélection premium',
     'cta_label',  'Découvrir la sélection',
     'cta_link',   '/catalogue',
     'cta2_label', 'Voir les Apple Watch',
     'cta2_link',  '/catalogue'
  )),
  ('home_cta', jsonb_build_object(
     'enabled',  true,
     'title',    'Une boutique à Lomé, des accessoires premium livrés dans la sous région.',
     'text',     'Passez en boutique pour essayer nos sélections, ou faites-vous livrer où que vous soyez dans la zone CEDEAO.',
     'cta_label','Nous contacter',
     'cta_link', '/contact'
  )),
  ('shipping', jsonb_build_object(
     'default_fee', 8000,
     'fees', jsonb_build_object(
        'Togo',          1500,
        'Bénin',         5000,
        'Ghana',         5000,
        'Burkina Faso',  5000,
        'Côte d''Ivoire',5000,
        'Niger',         6000,
        'Sénégal',       8000,
        'Mali',          8000,
        'Guinée',        8000,
        'Nigeria',       8000
     )
  ))
on conflict (key) do nothing;

insert into public.brands (slug, name, sort_order) values
  ('apple',   'Apple',   1),
  ('samsung', 'Samsung', 2),
  ('xiaomi',  'Xiaomi',  3),
  ('tecno',   'Tecno',   4),
  ('infinix', 'Infinix', 5),
  ('itel',    'Itel',    6),
  ('oppo',    'Oppo',    7),
  ('realme',  'Realme',  8),
  ('huawei',  'Huawei',  9),
  ('nokia',   'Nokia',   10)
on conflict (slug) do nothing;
