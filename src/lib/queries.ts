import { sql } from "@/lib/db";
import type { Category, Product, ProductReview } from "@/lib/types";

export async function getCategories(): Promise<Category[]> {
  return sql<Category[]>`
    select id, slug, name, description, image_url, created_at
    from categories
    order by
      case
        when lower(slug) like '%smartphone%' or lower(name) like '%smartphone%' then 1
        when lower(slug) like '%telephone%' or lower(name) like '%telephone%' then 1
        else 0
      end asc,
      sort_order asc,
      name asc
  `;
}

export async function getFeaturedProducts(limit = 8): Promise<Product[]> {
  return sql<Product[]>`
    select *
    from products
    where is_active = true and is_featured = true
    order by created_at desc
    limit ${limit}
  `;
}

type CatalogFilters = {
  q?: string;
  categorie?: string;
  marque?: string;
  prixMin?: number;
  prixMax?: number;
  tri?: "recent" | "prix-asc" | "prix-desc" | "nom";
};

export async function searchProducts(filters: CatalogFilters): Promise<Product[]> {
  const catCond = filters.categorie ? sql`and c.slug = ${filters.categorie}` : sql``;
  const brandCond = filters.marque ? sql`and p.brand = ${filters.marque}` : sql``;
  const qCond = filters.q ? sql`and p.name ilike ${"%" + filters.q + "%"}` : sql``;
  const minCond = filters.prixMin != null ? sql`and p.price >= ${filters.prixMin}` : sql``;
  const maxCond = filters.prixMax != null ? sql`and p.price <= ${filters.prixMax}` : sql``;

  const orderBy = (() => {
    switch (filters.tri) {
      case "prix-asc":  return sql`order by p.price asc`;
      case "prix-desc": return sql`order by p.price desc`;
      case "nom":       return sql`order by p.name asc`;
      default:          return sql`order by p.created_at desc`;
    }
  })();

  return sql<Product[]>`
    select p.*
    from products p
    left join categories c on c.id = p.category_id
    where p.is_active = true
    ${catCond}
    ${brandCond}
    ${qCond}
    ${minCond}
    ${maxCond}
    ${orderBy}
    limit 60
  `;
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const rows = await sql<Product[]>`
    select * from products where slug = ${slug} and is_active = true limit 1
  `;
  return rows[0] ?? null;
}

export async function getRelatedProducts(product: Product, limit = 4): Promise<Product[]> {
  return sql<Product[]>`
    select * from products
    where is_active = true and category_id = ${product.category_id} and id <> ${product.id}
    limit ${limit}
  `;
}

export async function getFrequentlyBoughtTogether(productId: string, limit = 4): Promise<Product[]> {
  return sql<Product[]>`
    select p.*
    from order_items oi_base
    join order_items oi_other
      on oi_other.order_id = oi_base.order_id
     and oi_other.product_id is not null
     and oi_other.product_id <> oi_base.product_id
    join products p
      on p.id = oi_other.product_id
     and p.is_active = true
    where oi_base.product_id = ${productId}
    group by p.id
    order by count(*) desc, p.created_at desc
    limit ${limit}
  `;
}

export async function getCartRecommendations(productIds: string[], limit = 4): Promise<Product[]> {
  if (productIds.length === 0) return [];
  const idArray = sql.array(productIds, 2950);

  const byCategory = await sql<Product[]>`
    select distinct on (p.id) p.*
    from products source
    join products p
      on p.category_id = source.category_id
     and p.is_active = true
     and p.id <> source.id
    where source.id = any(${idArray})
      and p.id <> all(${idArray})
    order by p.id, p.is_featured desc, p.created_at desc
    limit ${limit}
  `;
  if (byCategory.length >= limit) return byCategory;

  const fallback = await sql<Product[]>`
    select *
    from products
    where is_active = true
      and id <> all(${idArray})
    order by is_featured desc, created_at desc
    limit ${limit - byCategory.length}
  `;
  return [...byCategory, ...fallback];
}

export async function getProductSocialProof(productId: string): Promise<{
  soldCount: number;
  reviewCount: number;
  avgRating: number | null;
}> {
  const [soldRows] = await Promise.all([
    sql<{ sold_count: number }[]>`
      select coalesce(sum(oi.quantity), 0)::int as sold_count
      from order_items oi
      join orders o on o.id = oi.order_id
      where oi.product_id = ${productId}
        and o.status in ('paid', 'preparing', 'shipped', 'delivered')
    `
  ]);

  let reviewRows: { review_count: number; avg_rating: number | null }[] = [];
  try {
    reviewRows = await sql<{ review_count: number; avg_rating: number | null }[]>`
      select count(*)::int as review_count, round(avg(rating)::numeric, 1)::float8 as avg_rating
      from product_reviews
      where product_id = ${productId}
        and is_approved = true
    `;
  } catch {
    reviewRows = [{ review_count: 0, avg_rating: null }];
  }

  return {
    soldCount: soldRows[0]?.sold_count ?? 0,
    reviewCount: reviewRows[0]?.review_count ?? 0,
    avgRating: reviewRows[0]?.avg_rating ?? null
  };
}

export async function getProductReviews(productId: string, limit = 6): Promise<ProductReview[]> {
  try {
    return await sql<ProductReview[]>`
      select id, product_id, user_id, author_name, rating, comment, is_verified_purchase, is_approved, created_at
      from product_reviews
      where product_id = ${productId}
        and is_approved = true
      order by created_at desc
      limit ${limit}
    `;
  } catch {
    return [];
  }
}
