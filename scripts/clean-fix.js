const postgres = require('postgres');
const sql = postgres('postgresql://postgres:721RRTeJi5kiylmLxWAXc3ql1YzZWNnR@localhost:5432/store');

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

const homeHero = {
  enabled: true,
  slides: slides
};

const features = {
  enabled: true,
  items: [
    { icon: "Truck", title: "Livraison rapide", text: "Partout dans la sous région" },
    { icon: "ShieldCheck", title: "Produits garantis", text: "Authentiques et sous garantie" },
    { icon: "CreditCard", title: "Paiement sécurisé", text: "Mobile Money et cartes" },
    { icon: "Headset", title: "Service client", text: "Une équipe à votre écoute" }
  ]
};

const social = {
  facebook: "https://facebook.com/silviostore",
  instagram: "https://instagram.com/silviostore",
  twitter: "",
  tiktok: "https://tiktok.com/@silviostore",
  whatsapp: "https://wa.me/22800000000"
};

const footerLinks = {
  links: [
    { label: "Livraison", url: "/livraison" },
    { label: "Retours et remboursement", url: "/retours" },
    { label: "Conditions générales", url: "/cgv" },
    { label: "Nous contacter", url: "/contact" }
  ]
};

async function run() {
  try {
    // Delete first to be sure
    await sql`delete from settings where key in ('home_hero', 'features', 'social', 'footer_links')`;
    
    // Insert with sql.json to ensure correct format
    await sql`insert into settings (key, value) values ('home_hero', ${homeHero})`;
    await sql`insert into settings (key, value) values ('features', ${features})`;
    await sql`insert into settings (key, value) values ('social', ${social})`;
    await sql`insert into settings (key, value) values ('footer_links', ${footerLinks})`;
    
    console.log('Database cleaned and settings restored with correct format.');
    process.exit(0);
  } catch (err) {
    console.error('Clean fix failed:', err);
    process.exit(1);
  }
}

run();
