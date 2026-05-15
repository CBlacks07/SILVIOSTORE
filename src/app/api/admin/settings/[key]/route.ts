import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { getSetting, setSetting, type SettingsKey } from "@/lib/settings";

const ALLOWED: SettingsKey[] = ["site", "header_strip", "home_hero", "home_cta", "shipping", "features", "social", "footer_links", "testimonials", "marketing"];
const PUBLIC_READ: SettingsKey[] = ["marketing"]; // readable without auth for client components

export async function GET(_req: Request, { params }: { params: { key: string } }) {
  const key = params.key as SettingsKey;
  if (!PUBLIC_READ.includes(key)) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }
  const data = await getSetting(key);
  return NextResponse.json(data);
}

export async function PATCH(req: Request, { params }: { params: { key: string } }) {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const key = params.key as SettingsKey;
  if (!ALLOWED.includes(key)) {
    return NextResponse.json({ error: "Clé inconnue" }, { status: 400 });
  }

  try {
    const body = await req.json();
    await setSetting(key, body);
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: "Erreur interne" }, { status: 400 });
  }
}
