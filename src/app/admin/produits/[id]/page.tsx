import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { sql } from "@/lib/db";
import { ProductForm } from "@/components/admin/ProductForm";
import type { Product } from "@/lib/types";

export default async function EditProductPage({ params }: { params: { id: string } }) {
  const rows = await sql<Product[]>`select * from products where id = ${params.id} limit 1`;
  const product = rows[0];
  if (!product) notFound();

  const [categories, brands] = await Promise.all([
    sql<{ id: string; name: string }[]>`select id, name from categories order by name asc`,
    sql<{ name: string }[]>`select name from brands where is_active = true order by name asc`,
  ]);

  return (
    <>
      <header className="sticky top-0 z-20 bg-white/90 backdrop-blur border-b border-brand-100">
        <div className="flex items-center gap-3 px-4 py-3 md:px-8 md:py-4">
          <Link href="/admin/produits" className="p-1.5 text-brand-500 hover:text-brand-900 hover:bg-brand-100 rounded transition-colors">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 text-xs text-brand-400 mb-0.5">
              <span>Admin</span><span>›</span>
              <Link href="/admin/produits" className="hover:text-brand-700">Catalogue</Link>
              <span>›</span><span className="text-brand-700 font-medium truncate">Modifier</span>
            </div>
            <h1 className="font-display text-base md:text-xl font-bold text-brand-950 truncate">{product.name}</h1>
          </div>
        </div>
      </header>
      <div className="px-4 py-4 md:px-8 md:py-6">
        <div className="max-w-3xl">
          <ProductForm product={product} categories={categories} brands={brands.map(b => b.name)} />
        </div>
      </div>
    </>
  );
}
