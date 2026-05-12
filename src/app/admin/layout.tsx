// Admin Layout — remplace src/app/admin/layout.tsx
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { sql } from "@/lib/db";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/connexion?redirect=/admin");
  if (user.role !== "admin") redirect("/");

  const [counts] = await sql<{ pending_orders: number; pending_reviews: number }[]>`
    select
      (select count(*)::int from orders where status = 'pending') as pending_orders,
      (select count(*)::int from product_reviews where is_approved = false) as pending_reviews
  `;

  return (
    <div className="flex min-h-screen bg-brand-50/50">
      <AdminSidebar
        user={user}
        pendingOrders={counts?.pending_orders ?? 0}
        pendingReviews={counts?.pending_reviews ?? 0}
      />
      <main className="flex-1 min-w-0">
        {children}
      </main>
    </div>
  );
}
