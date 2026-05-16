import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { sql } from "@/lib/db";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  try {
    const { productId, rating, comment, photos } = (await req.json()) as {
      productId?: string;
      rating?: number;
      comment?: string;
      photos?: string[];
    };

    if (!productId) return NextResponse.json({ error: "Produit manquant" }, { status: 400 });
    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Note invalide" }, { status: 400 });
    }

    const products = await sql<{ id: string }[]>`
      select id from products where id = ${productId} and is_active = true limit 1
    `;
    if (!products[0]) return NextResponse.json({ error: "Produit introuvable" }, { status: 404 });

    const purchases = await sql<{ ok: boolean }[]>`
      select exists(
        select 1
        from order_items oi
        join orders o on o.id = oi.order_id
        where oi.product_id = ${productId}
          and o.user_id = ${user.id}
          and o.status in ('paid','preparing','shipped','delivered')
      ) as ok
    `;
    if (!purchases[0]?.ok) {
      return NextResponse.json({ error: "Achat vérifié requis pour laisser un avis" }, { status: 403 });
    }

    const authorName = user.full_name?.trim() || user.email.split("@")[0];
    const cleanComment = (comment || "").trim() || null;

    const existing = await sql<{ id: string }[]>`
      select id
      from product_reviews
      where user_id = ${user.id} and product_id = ${productId}
      limit 1
    `;

    if (existing[0]) {
      await sql`
        update product_reviews
        set rating = ${rating},
            comment = ${cleanComment},
            author_name = ${authorName},
            is_verified_purchase = true,
            is_approved = true
        where id = ${existing[0].id}
      `;
    } else {
      await sql`
        insert into product_reviews (
          product_id, user_id, author_name, rating, comment, is_verified_purchase, is_approved, photos
        ) values (
          ${productId}, ${user.id}, ${authorName}, ${rating}, ${cleanComment}, true, true,
          ${(photos && photos.length > 0 ? photos.slice(0, 3) : []) as string[]}
        )
      `;
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    const message = String(e?.message || "");
    if (message.includes("relation \"product_reviews\" does not exist")) {
      return NextResponse.json(
        { error: "La table des avis n'existe pas encore. Lancez la migration." },
        { status: 500 }
      );
    }
    return NextResponse.json({ error: "Impossible d'enregistrer l'avis" }, { status: 500 });
  }
}

