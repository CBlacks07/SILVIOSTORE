export type Category = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  image_url: string | null;
  sort_order: number;
  created_at: string;
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  long_description: string | null;
  brand: string | null;
  category_id: string;
  price: number;
  compare_at_price: number | null;
  stock: number;
  sku: string | null;
  is_active: boolean;
  is_featured: boolean;
  images: string[];
  variants: ProductVariant[] | null;
  specifications: ProductSpec[] | null;
  faq: ProductFaq[] | null;
  created_at: string;
  updated_at: string;
};

export type ProductVariant = {
  name: string;
  options: { label: string; value: string; stock: number; price_diff: number }[];
};

export type ProductSpec = { label: string; value: string };

export type ProductFaq = { question: string; answer: string };

export type ProductReview = {
  id: string;
  product_id: string;
  user_id: string | null;
  author_name: string;
  rating: number;
  comment: string | null;
  is_verified_purchase: boolean;
  is_approved: boolean;
  created_at: string;
};

export type CartItem = {
  productId: string;
  slug: string;
  name: string;
  image: string | null;
  unitPrice: number;
  quantity: number;
  variantLabel: string;
};

export type Address = {
  id: string;
  user_id: string;
  full_name: string;
  phone: string;
  country: string;
  city: string;
  district: string | null;
  details: string;
  is_default: boolean;
};

export type OrderStatus = "pending" | "paid" | "preparing" | "shipped" | "delivered" | "cancelled";

export type Order = {
  id: string;
  reference: string;
  user_id: string | null;
  status: OrderStatus;
  subtotal: number;
  shipping_cost: number;
  total: number;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  shipping_address: string;
  shipping_country: string;
  shipping_city: string;
  payment_provider: "fedapay" | null;
  payment_reference: string | null;
  paid_at: string | null;
  created_at: string;
};

export type OrderItem = {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  unit_price: number;
  quantity: number;
  variant_label: string | null;
};

export type Profile = {
  id: string;
  full_name: string | null;
  phone: string | null;
  role: "customer" | "admin";
  created_at: string;
};

export type Brand = {
  id: string;
  slug: string;
  name: string;
  logo_url: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
};

export type BannerPosition = "home_hero" | "home_mid" | "catalogue_top" | "header_strip";

export type Banner = {
  id: string;
  title: string;
  subtitle: string | null;
  image_url: string | null;
  link_url: string | null;
  cta_label: string | null;
  position: BannerPosition;
  sort_order: number;
  is_active: boolean;
  starts_at: string | null;
  ends_at: string | null;
  created_at: string;
};

export type PromotionType = "percent" | "amount";

export type Promotion = {
  id: string;
  code: string;
  description: string | null;
  discount_type: PromotionType;
  discount_value: number;
  min_order: number;
  max_uses: number | null;
  used_count: number;
  starts_at: string | null;
  ends_at: string | null;
  is_active: boolean;
  created_at: string;
};

export type SiteSettings = {
  name: string;
  logo_url?: string;
  logo_footer_url?: string;
  tagline: string;
  description: string;
  phone: string;
  phone2?: string;
  email: string;
  address: string;
  currency: string;
};

export type HeaderStripSettings = { enabled: boolean; text: string };

export type MarketingSettings = {
  welcome_popup: {
    enabled: boolean;
    promo_code: string;
    title: string;
    description: string;
    delay_seconds: number;
  };
  social_proof: {
    enabled: boolean;
    interval_seconds: number;
    fallback_items: { buyer: string; city: string; product: string }[];
  };
  stock_urgency: {
    enabled: boolean;
    threshold: number;
  };
  exit_intent: {
    enabled: boolean;
    title: string;
    description: string;
    arm_delay_seconds: number;
  };
  cart_reminder: {
    enabled: boolean;
    delay_seconds: number;
  };
};

export type HomeHeroSlide = {
  image_url: string;
  badge_text: string;
  title: string;
  subtitle: string;
  cta_label: string;
  cta_link: string;
  cta2_label: string;
  cta2_link: string;
};

export type HomeHeroSettings = {
  enabled: boolean;
  title: string;
  subtitle: string;
  image_url: string;
  images: string[];
  slides: HomeHeroSlide[];
  video_url: string;
  badge_text: string;
  cta_label: string;
  cta_link: string;
  cta2_label: string;
  cta2_link: string;
};

export type HomeCtaSettings = {
  enabled: boolean;
  title: string;
  text: string;
  cta_label: string;
  cta_link: string;
};

export type ShippingSettings = {
  default_fee: number;
  fees: Record<string, number>;
};

export type FeatureItem = {
  icon: string;
  title: string;
  text: string;
};

export type FeatureSettings = {
  enabled: boolean;
  items: FeatureItem[];
};

export type SocialSettings = {
  facebook: string;
  instagram: string;
  twitter: string;
  tiktok: string;
  whatsapp: string;
};

export type FooterLink = { label: string; url: string };

export type FooterLinksSettings = {
  links: FooterLink[];
};

export type Testimonial = {
  name: string;
  location: string;
  rating: number;
  text: string;
};

export type TestimonialsSettings = {
  enabled: boolean;
  title: string;
  subtitle: string;
  items: Testimonial[];
};
