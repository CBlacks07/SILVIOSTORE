import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { sendNewsletterWelcome } from "@/lib/email";
import { getSetting } from "@/lib/settings";

export async function POST(req: Request) {
  try {
    const { email, source } = await req.json();
    if (!email || typeof email !== "string") {
      return NextResponse.json({ ok: false, error: "Email requis" }, { status: 400 });
    }
    const emailTrimmed = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailTrimmed)) {
      return NextResponse.json({ ok: false, error: "Email invalide" }, { status: 400 });
    }

    await sql`
      INSERT INTO newsletter_emails (email, source)
      VALUES (${emailTrimmed}, ${source || "welcome_popup"})
      ON CONFLICT (email) DO NOTHING
    `;

    // Send welcome email (best-effort)
    try {
      const marketing = await getSetting("marketing");
      await sendNewsletterWelcome(emailTrimmed, marketing.welcome_popup.promo_code);
    } catch {}

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}
