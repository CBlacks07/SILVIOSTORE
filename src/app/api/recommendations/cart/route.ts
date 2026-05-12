import { NextResponse } from "next/server";
import { getCartRecommendations } from "@/lib/queries";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const ids = (searchParams.get("ids") || "")
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean)
    .slice(0, 20);

  if (ids.length === 0) return NextResponse.json({ products: [] });
  const products = await getCartRecommendations(ids, 4);
  return NextResponse.json({ products });
}

