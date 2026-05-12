import { sql } from "@/lib/db";
import { ProductForm } from "@/components/admin/ProductForm";

export default async function NewProductPage() {
  const categories = await sql<{ id: string; name: string }[]>`
    select id, name from categories order by name asc
  `;
  return (
    <div className="max-w-3xl">
      <h1 className="font-display text-2xl font-bold text-brand-950 mb-6">Nouveau produit</h1>
      <ProductForm categories={categories} />
    </div>
  );
}
