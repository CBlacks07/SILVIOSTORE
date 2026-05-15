import { sql } from "@/lib/db";
import { getSetting } from "@/lib/settings";
import { sanitizeSiteName } from "@/lib/siteBrand";
import { HeaderClient } from "./HeaderClient";
import type { Category } from "@/lib/types";

export async function Header() {
  const [site, headerStrip, categories] = await Promise.all([
    getSetting("site"),
    getSetting("header_strip"),
    sql<Pick<Category, "slug" | "name">[]>`
      select slug, name from categories
      order by
        case
          when lower(slug) like '%smartphone%' or lower(name) like '%smartphone%' then 1
          when lower(slug) like '%telephone%' or lower(name) like '%telephone%' then 1
          else 0
        end asc,
        sort_order asc,
        name asc
    `
  ]);

  const brandName = sanitizeSiteName(site.name) || "SILVIO STORE";

  return (
    <HeaderClient
      siteName={brandName}
      logoUrl={site.logo_url}
      phone={site.phone}
      headerStrip={headerStrip}
      categories={categories}
    />
  );
}
