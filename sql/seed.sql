-- SILVIO STORE - Données de démarrage
-- Mot de passe par défaut de l'admin : Admin2026! (à changer immédiatement)
-- Le hash bcrypt ci-dessous correspond à "Admin2026!" (coût 10).

insert into public.users (email, password_hash, full_name, role)
values (
  'admin@silviostore.com',
  '$2a$10$WD8HZm5aMeWlS.2fbqsxheBLNnA6fKzPfigyqLLvSC9kqi/H/UwW2',
  'Administrateur',
  'admin'
)
on conflict (email) do nothing;

insert into public.categories (slug, name, description, sort_order) values
  ('coques', 'Coques et étuis', 'Protection et style pour vos appareils mobiles', 1),
  ('ecouteurs', 'Écouteurs et casques', 'Audio filaire et sans fil', 2),
  ('chargeurs', 'Chargeurs et câbles', 'Chargeurs secteur, voiture et câbles USB', 3),
  ('protections', 'Verres trempés', 'Protection d''écran haute résistance', 4),
  ('accessoires', 'Autres accessoires', 'Supports, cartes mémoire, powerbanks et plus', 5)
on conflict (slug) do nothing;

with c as (select id, slug from public.categories)
insert into public.products (slug, name, description, brand, category_id, price, compare_at_price, stock, is_featured, images)
values
  (
    'coque-silicone-iphone-15',
    'Coque silicone iPhone 15',
    'Coque silicone premium, intérieur microfibre, plusieurs coloris.',
    null,
    (select id from c where slug='coques'),
    6500,
    null,
    80,
    true,
    array['/placeholder-product.svg']
  ),
  (
    'coque-magsafe-iphone-15-pro',
    'Coque MagSafe iPhone 15 Pro',
    'Coque transparente renforcée avec anneau MagSafe intégré.',
    null,
    (select id from c where slug='coques'),
    12000,
    15000,
    35,
    true,
    array['/placeholder-product.svg']
  ),
  (
    'ecouteurs-bluetooth-pro',
    'Écouteurs Bluetooth Pro',
    'Écouteurs sans fil, réduction de bruit active, autonomie 24h avec boîtier.',
    null,
    (select id from c where slug='ecouteurs'),
    18500,
    25000,
    45,
    true,
    array['/placeholder-product.svg']
  ),
  (
    'casque-bluetooth-lite',
    'Casque Bluetooth Lite',
    'Casque sans fil pliable, autonomie 30h, micro intégré.',
    null,
    (select id from c where slug='ecouteurs'),
    22000,
    null,
    26,
    false,
    array['/placeholder-product.svg']
  ),
  (
    'chargeur-rapide-usbc-20w',
    'Chargeur rapide USB-C 20W',
    'Chargeur secteur USB-C 20W compatible iOS et Android, câble inclus.',
    null,
    (select id from c where slug='chargeurs'),
    8500,
    null,
    60,
    true,
    array['/placeholder-product.svg']
  ),
  (
    'cable-usbc-2m-renforce',
    'Câble USB-C 2m renforcé',
    'Câble tressé anti-casse 2m avec charge rapide.',
    null,
    (select id from c where slug='chargeurs'),
    4500,
    null,
    90,
    false,
    array['/placeholder-product.svg']
  ),
  (
    'verre-trempe-iphone-15',
    'Verre trempé iPhone 15',
    'Protection d''écran 9H, anti-rayures, pose facile sans bulles.',
    null,
    (select id from c where slug='protections'),
    3500,
    null,
    120,
    true,
    array['/placeholder-product.svg']
  ),
  (
    'film-hydrogel-universel',
    'Film hydrogel universel',
    'Protection souple anti-traces compatible avec plusieurs modèles.',
    null,
    (select id from c where slug='protections'),
    3000,
    null,
    75,
    false,
    array['/placeholder-product.svg']
  ),
  (
    'support-voiture-magnetique',
    'Support voiture magnétique',
    'Support compact pour grille d''aération avec fixation magnétique.',
    null,
    (select id from c where slug='accessoires'),
    7000,
    null,
    40,
    true,
    array['/placeholder-product.svg']
  ),
  (
    'powerbank-20000mah',
    'Powerbank 20 000 mAh',
    'Batterie externe 20 000 mAh, 3 ports USB, charge rapide.',
    null,
    (select id from c where slug='accessoires'),
    14000,
    null,
    35,
    true,
    array['/placeholder-product.svg']
  )
on conflict (slug) do nothing;
