import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { sendOrderStatusUpdate } from "@/lib/email";
import { isValidUUID, invalidId } from "@/lib/utils";

const ALLOWED = ["pending", "paid", "preparing", "shipped", "delivered", "cancelled"];

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });
  if (!isValidUUID(params.id)) return invalidId();

  const { status } = await req.json();
  if (!ALLOWED.includes(status)) {
    return NextResponse.json({ error: "Statut invalide" }, { status: 400 });
  }

  try {
    await sql`update orders set status = ${status} where id = ${params.id}`;

    // Send status update email (best-effort)
    if (["preparing", "shipped", "delivered", "cancelled"].includes(status)) {
      try {
        const rows = await sql<{ reference: string; email: string; full_name: string }[]>`
          SELECT o.reference, u.email, u.full_name
          FROM orders o LEFT JOIN users u ON u.id = o.user_id
          WHERE o.id = ${params.id} LIMIT 1
        `;
        if (rows[0]?.email) {
          await sendOrderStatusUpdate({
            reference: rows[0].reference,
            customerEmail: rows[0].email,
            customerName: rows[0].full_name || "Client",
            status,
          });
        }
      } catch (emailErr) {
        console.error("status email error", emailErr);
      }
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: "Erreur interne" }, { status: 400 });
  }
}
