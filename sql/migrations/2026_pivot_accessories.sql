-- Pivot de positionnement : accessoires premium (pochettes, bracelets Apple, Apple Watch,
-- coques, chargeurs). Écrase les settings publics pour que l'accueil reflète le nouveau cap.
-- A exécuter une fois après le pivot. Ne touche pas aux produits/catégories existants.

update public.settings
   set value = jsonb_build_object(
       'name',        'SILVIO STORE',
       'tagline',     'Accessoires premium Apple et plus encore, dans la sous région',
       'description', 'Pochettes haut de gamme, bracelets Apple, Apple Watch, coques et chargeurs de qualité. Livraison dans toute la sous région.',
       'phone',       coalesce(value->>'phone',    '+228 00 00 00 00'),
       'email',       coalesce(value->>'email',    'contact@silviostore.com'),
       'address',     coalesce(value->>'address',  'Lomé, Togo'),
       'currency',    coalesce(value->>'currency', 'XOF')
   ),
   updated_at = now()
 where key = 'site';

update public.settings
   set value = jsonb_build_object(
       'enabled', true,
       'text',    'Accessoires premium livrés dans toute la sous région'
   ),
   updated_at = now()
 where key = 'header_strip';

update public.settings
   set value = value
       || jsonb_build_object(
            'title',      'Accessoires premium pour Apple Watch, iPhone et votre quotidien.',
            'subtitle',   'Pochettes haut de gamme, bracelets Apple, Apple Watch, coques et chargeurs de qualité. Paiement sécurisé Mobile Money et carte, livraison sous région.',
            'badge_text', 'Sélection premium',
            'cta_label',  'Découvrir la sélection',
            'cta_link',   '/catalogue',
            'cta2_label', 'Voir les Apple Watch',
            'cta2_link',  '/catalogue'
          ),
   updated_at = now()
 where key = 'home_hero';

update public.settings
   set value = value
       || jsonb_build_object(
            'title', 'Une boutique à Lomé, des accessoires premium livrés dans la sous région.',
            'text',  'Passez en boutique pour essayer nos sélections, ou faites-vous livrer où que vous soyez dans la zone CEDEAO.'
          ),
   updated_at = now()
 where key = 'home_cta';
