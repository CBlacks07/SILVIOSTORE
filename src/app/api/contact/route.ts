import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const TO     = "contact@silviostore.com";
const FROM   = process.env.RESEND_FROM_EMAIL || "SILVIO STORE <contact@silviostore.com>";

// Simple in-memory rate limit: 3 messages / 10 min par IP
const rl = new Map<string, { count: number; resetAt: number }>();
function rateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rl.get(ip);
  if (entry && now < entry.resetAt) {
    if (entry.count >= 3) return false;
    entry.count++;
  } else {
    rl.set(ip, { count: 1, resetAt: now + 10 * 60 * 1000 });
  }
  return true;
}

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] ?? "unknown";
  if (!rateLimit(ip)) {
    return NextResponse.json({ error: "Trop de messages. Réessayez dans 10 minutes." }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Requête invalide." }, { status: 400 });

  const name    = String(body.name    ?? "").trim().slice(0, 100);
  const email   = String(body.email   ?? "").trim().slice(0, 200);
  const subject = String(body.subject ?? "").trim().slice(0, 200);
  const message = String(body.message ?? "").trim().slice(0, 5000);

  if (!name || !email || !subject || !message) {
    return NextResponse.json({ error: "Tous les champs sont requis." }, { status: 400 });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Adresse e-mail invalide." }, { status: 400 });
  }

  try {
    await resend.emails.send({
      from: FROM,
      to: TO,
      replyTo: email,
      subject: `[Contact SILVIO STORE] ${subject}`,
      html: `
        <div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;padding:32px;background:#faf8f5;">
          <p style="font-size:11px;font-weight:800;letter-spacing:0.25em;text-transform:uppercase;color:#d97706;margin:0 0 20px">SILVIO STORE — Message de contact</p>
          <table style="width:100%;border-collapse:collapse;margin-bottom:24px;background:#fff;border-radius:10px;overflow:hidden;">
            <tr><td style="padding:12px 16px;border-bottom:1px solid #f0e8d8;font-size:13px;color:#9ca3af;width:100px">De</td><td style="padding:12px 16px;border-bottom:1px solid #f0e8d8;font-size:14px;color:#1a1008;font-weight:600">${name}</td></tr>
            <tr><td style="padding:12px 16px;border-bottom:1px solid #f0e8d8;font-size:13px;color:#9ca3af">Email</td><td style="padding:12px 16px;border-bottom:1px solid #f0e8d8;font-size:14px;color:#1a1008"><a href="mailto:${email}" style="color:#d97706">${email}</a></td></tr>
            <tr><td style="padding:12px 16px;font-size:13px;color:#9ca3af">Sujet</td><td style="padding:12px 16px;font-size:14px;color:#1a1008;font-weight:600">${subject}</td></tr>
          </table>
          <div style="background:#fff;border-radius:10px;padding:20px;font-size:14px;color:#1a1008;line-height:1.7;white-space:pre-wrap;">${message.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</div>
          <p style="margin-top:24px;font-size:11px;color:#9ca3af;">Répondez directement à cet email pour contacter ${name}.</p>
        </div>
      `,
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Erreur lors de l'envoi. Réessayez ou contactez-nous sur WhatsApp." }, { status: 500 });
  }
}
