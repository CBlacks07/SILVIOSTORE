import { sql } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { getFedaPayTransaction } from "@/lib/fedapay";
import { OrdersList } from "@/components/account/OrdersList";

export default async function OrdersPage() {
  const user = (await getCurrentUser())!;
  const initialOrders = await sql<Order[]>`
    select * from orders where user_id = ${user.id} order by created_at desc
  `;

  const pendingOrders = initialOrders.filter((o) => o.status === "pending" && o.payment_reference);
  if (pendingOrders.length > 0) {
    for (const order of pendingOrders) {
      try {
        const tx = await getFedaPayTransaction(Number(order.payment_reference));
        if (["canceled", "declined", "failed"].includes(tx.status)) {
          await sql`
            update orders
            set status = 'cancelled'
            where id = ${order.id}
              and status = 'pending'
          `;
        }
      } catch {
        // Keep pending if remote check fails.
      }
    }
  }

  const orders = await sql<{ id: string; reference: string; status: string; total: number; created_at: string; is_hidden: boolean }[]>`
    SELECT id, reference, status, total, created_at, COALESCE(is_hidden, false) as is_hidden
    FROM orders WHERE user_id = ${user.id} ORDER BY created_at DESC
  `;

  return (
    <div className="card p-6">
      <h2 className="mb-4 font-semibold text-brand-950">Mes commandes</h2>
      <OrdersList initialOrders={orders} />
    </div>
  );
}
