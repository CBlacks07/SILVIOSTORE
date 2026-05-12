export const SITE = {
  name: "SILVIO STORE",
  tagline: "Accessoires mobiles premium livrés dans toute la sous-région",
  description:
    "Coques, protections d'écran, chargeurs, câbles, écouteurs et accessoires du quotidien. Paiement sécurisé et livraison rapide.",
  contact: {
    phone: "+228 92 60 25 19",
    phone2: "+228 98 96 53 44",
    email: "contact@silviostore.com",
    address: "Lomé-Nukafu, Togo"
  },
  shipping: {
    countries: [
      "Togo",
      "Bénin",
      "Côte d'Ivoire",
      "Burkina Faso",
      "Sénégal",
      "Mali",
      "Ghana",
      "Niger",
      "Guinée",
      "Nigeria"
    ]
  },
  currency: "XOF"
} as const;

export const CATEGORIES = [
  { slug: "coques", label: "Coques et étuis" },
  { slug: "ecouteurs", label: "Écouteurs et casques" },
  { slug: "chargeurs", label: "Chargeurs et câbles" },
  { slug: "protections", label: "Verres trempés" },
  { slug: "accessoires", label: "Autres accessoires" }
] as const;

export const BRANDS = [
  "Apple", "Samsung", "Xiaomi", "Tecno", "Infinix",
  "Itel", "Oppo", "Realme", "Huawei", "Nokia"
] as const;
