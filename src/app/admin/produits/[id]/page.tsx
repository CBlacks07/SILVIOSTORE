import { notFound } from "next/navigation";
import { sql } from "@/lib/db";
import { ProductForm } from "@/components/admin/ProductForm";
import type { Product } from "@/lib/types";

export default async function EditProductPage({ params }: { params: { id: string } }) {
  const rows = await sql<Product[]>`select * from products where id = ${params.id} limit 1`;
  const product = rows[0];
  if (!product) notFound();

  const categories = await sql<{ id: string; name: string }[]>`
    select id, name from categories order by name asc
  `;

  return (
    <div className="max-w-3xl">
      <h1 className="font-display text-2xl font-bold text-brand-950 mb-6">Modifier le produit</h1>
      <ProductForm product={product} categories={categories} />
    </div>
  );
}
