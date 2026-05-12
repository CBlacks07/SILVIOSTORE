-- Mise à jour copy site — devise : "Luxe, tendance et protection réunis."

-- 1. Infos site
update public.settings
   set value = value || jsonb_build_object(
     'tagline',     'Luxe, tendance et protection réunis.',
     'description', 'La référence des accessoires premium dans la sous région. Pochettes, bracelets Apple, coques et chargeurs de qualité.'
   ),
   updated_at = now()
 where key = 'site';

-- 2. Bandeau header
update public.settings
   set value = jsonb_build_object(
     'enabled', true,
     'text',    'Luxe, tendance et protection — Livraison dans toute la sous région'
   ),
   updated_at = now()
 where key = 'header_strip';

-- 3. Hero — texte global + 5 slides
update public.settings
   set value = value || jsonb_build_object(
     'title',      'Luxe, tendance et protection réunis.',
     'subtitle',   'La boutique de référence pour les accessoires premium dans la sous région. Livraison rapide, paiement Mobile Money.',
     'badge_text', 'SILVIO STORE',
     'cta_label',  'Découvrir la collection',
     'cta_link',   '/catalogue',
     'cta2_label', '',
     'cta2_link',  '',
     'slides', jsonb_build_array(
       jsonb_build_object(
         'image_url',  '',
         'badge_text', 'SILVIO STORE',
         'title',      'Luxe, tendance et protection réunis.',
         'subtitle',   'La boutique de référence pour les accessoires premium dans la sous région.',
         'cta_label',  'Découvrir la collection',
         'cta_link',   '/catalogue',
         'cta2_label', '',
         'cta2_link',  ''
       ),
       jsonb_build_object(
         'image_url',  '',
         'badge_text', 'LUXE & PROTECTION',
         'title',      'Style et protection, sans compromis.',
         'subtitle',   'Des coques qui font tourner les têtes. Matériaux premium, design exclusif, protection maximale.',
         'cta_label',  'Voir les coques',
         'cta_link',   '/catalogue?categorie=coques',
         'cta2_label', '',
         'cta2_link',  ''
       ),
       jsonb_build_object(
         'image_url',  '',
         'badge_text', 'COLLECTION EXCLUSIVE',
         'title',      'Protégez ce qui compte.',
         'subtitle',   'Pochettes haut de gamme pour iPhone. Le luxe au quotidien, la protection sans concession.',
         'cta_label',  'Voir les pochettes',
         'cta_link',   '/catalogue',
         'cta2_label', '',
         'cta2_link',  ''
       ),
       jsonb_build_object(
         'image_url',  '',
         'badge_text', 'TENDANCE',
         'title',      'Habillez votre Apple Watch.',
         'subtitle',   'Bracelets cuir, milanais, sport. Changez de style selon votre humeur, chaque jour.',
         'cta_label',  'Explorer les bracelets',
         'cta_link',   '/catalogue',
         'cta2_label', '',
         'cta2_link',  ''
       ),
       jsonb_build_object(
         'image_url',  '',
         'badge_text', 'QUALITÉ PREMIUM',
         'title',      'Chargez vite, chargez bien.',
         'subtitle',   'MagSafe, USB-C, câbles tressés. La qualité que votre appareil mérite.',
         'cta_label',  'Voir les chargeurs',
         'cta_link',   '/catalogue?categorie=chargeurs',
         'cta2_label', '',
         'cta2_link',  ''
       )
     )
   ),
   updated_at = now()
 where key = 'home_hero';

-- 4. CTA bas de page
update public.settings
   set value = value || jsonb_build_object(
     'title', 'Votre style mérite le meilleur.',
     'text',  'Passez en boutique à Lomé ou faites-vous livrer partout dans la sous région. Mobile Money et cartes acceptés.'
   ),
   updated_at = now()
 where key = 'home_cta';
