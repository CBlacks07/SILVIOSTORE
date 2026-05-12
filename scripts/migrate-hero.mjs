import { sql } from '../src/lib/db';

const slides = [
  {
    image_url: '/images/Goyard_iPhone_Case_Patterned_1.jpeg',
    badge_text: 'Exclusivité',
    title: "L'Exclusivité Goyard",
    subtitle: 'Le luxe et la protection réunis pour votre iPhone.',
    cta_label: 'Découvrir la collection',
    cta_link: '/catalogue?marque=goyard'
  },
  {
    image_url: '/images/Leather_Protective_Shell_9.jpeg',
    badge_text: 'Premium',
    title: 'Cuir Premium',
    subtitle: 'Une texture unique et une prise en main incomparable.',
    cta_label: 'Voir les modèles',
    cta_link: '/catalogue?categorie=cuir'
  },
  {
    image_url: '/images/Instagram_Leather_iPhone_Case_Strap_107.jpeg',
    badge_text: 'Nouveauté',
    title: 'Style & Liberté',
    subtitle: 'Gardez votre iPhone à portée de main avec nos lanières.',
    cta_label: 'Acheter maintenant',
    cta_link: '/catalogue'
  }
];

async function run() {
  try {
    const value = { enabled: true, slides };
    await sql`
      insert into settings (key, value, updated_at)
      values ('home_hero', ${JSON.stringify(value)}, now())
      on conflict (key) do update set value = excluded.value, updated_at = now()
    `;
    console.log('Successfully migrated slides to database.');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

run();
