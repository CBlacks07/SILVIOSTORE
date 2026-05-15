import { NextResponse } from "next/server";
import { validatePromotion } from "@/lib/promotions";

export async function POST(req: Request) {
  try {
    const { code, subtotal } = await req.json();
    if (!code || typeof subtotal !== "number") {
      return NextResponse.json({ ok: false, error: "Paramètres invalides" }, { status: 400 });
    }
    const result = await validatePromotion(code, subtotal);
    if (!result.ok) return NextResponse.json(result, { status: 400 });
    return NextResponse.json({
      ok: true,
      id: result.promotion.id,
      code: result.promotion.code,
      discount: result.discount,
      type: result.promotion.discount_type,
      value: result.promotion.discount_value
    });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}
