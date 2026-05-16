import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.RESEND_FROM_EMAIL || "SILVIO STORE <contact@silviostore.com>";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://silviostore.vercel.app";

// ─────────────────────────────────────────
// Email de confirmation de commande
// ─────────────────────────────────────────
export async function sendOrderConfirmation(order: {
  reference: string;
  customerName: string;
  customerEmail: string;
  items: { name: string; quantity: number; price: number }[];
  total: number;
  shippingAddress?: string;
}) {
  const itemRows = order.items.map(i =>
    `<tr>
      <td style="padding:10px 16px;border-bottom:1px solid #f0e8d8;font-size:14px;color:#1a1008">${i.name}</td>
      <td style="padding:10px 16px;border-bottom:1px solid #f0e8d8;font-size:14px;color:#1a1008;text-align:center">${i.quantity}</td>
      <td style="padding:10px 16px;border-bottom:1px solid #f0e8d8;font-size:14px;color:#1a1008;text-align:right;font-weight:700">${(i.price).toLocaleString("fr-FR")} F CFA</td>
    </tr>`
  ).join("");

  const html = `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#faf8f5;font-family:Georgia,'Times New Roman',serif">
  <div style="max-width:600px;margin:0 auto;padding:32px 16px">

    <!-- Header -->
    <div style="background:linear-gradient(135deg,#1a1008 0%,#2c1c06 100%);border-radius:16px 16px 0 0;padding:32px;text-align:center">
      <p style="margin:0;font-size:11px;font-weight:800;letter-spacing:0.28em;text-transform:uppercase;color:#d97706;margin-bottom:8px">SILVIO STORE</p>
      <h1 style="margin:0;font-size:26px;font-weight:700;color:#ffffff;line-height:1.2">Commande confirmée !</h1>
      <p style="margin:12px 0 0;font-size:14px;color:rgba(253,230,138,0.80)">Merci pour votre confiance, ${order.customerName}.</p>
    </div>

    <!-- Body -->
    <div style="background:#ffffff;padding:32px;border:1px solid rgba(217,119,6,0.15)">
      <p style="margin:0 0 8px;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.15em;color:#d97706">Référence</p>
      <p style="margin:0 0 24px;font-size:20px;font-weight:900;color:#1a1008;font-family:monospace">${order.reference}</p>

      <!-- Items -->
      <table style="width:100%;border-collapse:collapse;margin-bottom:24px">
        <thead>
          <tr style="background:#faf8f5">
            <th style="padding:10px 16px;text-align:left;font-size:11px;text-transform:uppercase;letter-spacing:0.1em;color:#6b7280;font-weight:600">Produit</th>
            <th style="padding:10px 16px;text-align:center;font-size:11px;text-transform:uppercase;letter-spacing:0.1em;color:#6b7280;font-weight:600">Qté</th>
            <th style="padding:10px 16px;text-align:right;font-size:11px;text-transform:uppercase;letter-spacing:0.1em;color:#6b7280;font-weight:600">Prix</th>
          </tr>
        </thead>
        <tbody>${itemRows}</tbody>
        <tfoot>
          <tr style="background:#faf8f5">
            <td colspan="2" style="padding:14px 16px;font-weight:700;font-size:15px;color:#1a1008">Total</td>
            <td style="padding:14px 16px;text-align:right;font-weight:900;font-size:18px;color:#d97706">${order.total.toLocaleString("fr-FR")} F CFA</td>
          </tr>
        </tfoot>
      </table>

      ${order.shippingAddress ? `<p style="font-size:13px;color:#6b7280;margin:0 0 24px"><strong style="color:#1a1008">Livraison :</strong> ${order.shippingAddress}</p>` : ""}

      <!-- CTA -->
      <div style="text-align:center;margin-top:28px">
        <a href="${SITE_URL}/commande/${order.reference}" style="display:inline-block;background:linear-gradient(135deg,#d97706,#f59e0b);color:#ffffff;font-weight:700;font-size:14px;padding:14px 32px;border-radius:8px;text-decoration:none">
          Suivre ma commande
        </a>
      </div>
    </div>

    <!-- Footer -->
    <div style="background:#1a1008;border-radius:0 0 16px 16px;padding:20px 32px;text-align:center">
      <p style="margin:0;font-size:12px;color:rgba(253,230,138,0.60)">Questions ? WhatsApp : +228 92 60 25 19 · <a href="mailto:contact@silviostore.com" style="color:#d97706">contact@silviostore.com</a></p>
      <p style="margin:8px 0 0;font-size:11px;color:rgba(255,255,255,0.25)">Lomé-Nukafu, Togo · SILVIO STORE</p>
    </div>

  </div>
</body>
</html>`;

  return resend.emails.send({
    from: FROM,
    to: order.customerEmail,
    subject: `✅ Commande confirmée — ${order.reference}`,
    html,
  });
}

// ─────────────────────────────────────────
// Email de bienvenue newsletter
// ─────────────────────────────────────────
export async function sendNewsletterWelcome(email: string, promoCode?: string) {
  const html = `
<!DOCTYPE html>
<html lang="fr">
<body style="margin:0;padding:0;background:#faf8f5;font-family:Georgia,'Times New Roman',serif">
  <div style="max-width:560px;margin:0 auto;padding:32px 16px">
    <div style="background:linear-gradient(135deg,#1a1008 0%,#2c1c06 100%);border-radius:16px 16px 0 0;padding:32px;text-align:center">
      <p style="margin:0 0 8px;font-size:11px;font-weight:800;letter-spacing:0.28em;text-transform:uppercase;color:#d97706">SILVIO STORE</p>
      <h1 style="margin:0;font-size:24px;font-weight:700;color:#fff">Bienvenue dans la famille !</h1>
    </div>
    <div style="background:#fff;padding:32px;border:1px solid rgba(217,119,6,0.15);text-align:center">
      <p style="font-size:15px;color:#1a1008;line-height:1.7">Merci de rejoindre SILVIO STORE — la référence des accessoires premium dans la sous région.</p>
      ${promoCode ? `
      <div style="background:rgba(217,119,6,0.08);border:1px dashed rgba(217,119,6,0.50);border-radius:12px;padding:20px;margin:24px 0">
        <p style="margin:0 0 4px;font-size:11px;font-weight:700;letter-spacing:0.2em;color:#d97706">VOTRE CODE -10%</p>
        <p style="margin:0;font-size:28px;font-weight:900;color:#1a1008;font-family:monospace;letter-spacing:0.1em">${promoCode}</p>
        <p style="margin:8px 0 0;font-size:12px;color:#6b7280">Valable sur votre première commande</p>
      </div>` : ""}
      <a href="${SITE_URL}/catalogue" style="display:inline-block;background:linear-gradient(135deg,#d97706,#f59e0b);color:#fff;font-weight:700;font-size:14px;padding:14px 32px;border-radius:8px;text-decoration:none;margin-top:8px">
        Découvrir la collection
      </a>
    </div>
    <div style="background:#1a1008;border-radius:0 0 16px 16px;padding:16px 32px;text-align:center">
      <p style="margin:0;font-size:11px;color:rgba(255,255,255,0.30)">© SILVIO STORE · Lomé-Nukafu, Togo</p>
    </div>
  </div>
</body>
</html>`;

  return resend.emails.send({
    from: FROM,
    to: email,
    subject: `Bienvenue chez SILVIO STORE 🎁${promoCode ? ` — Votre code ${promoCode}` : ""}`,
    html,
  });
}

// ─────────────────────────────────────────
// Email de mise à jour de commande
// ─────────────────────────────────────────
export async function sendOrderStatusUpdate(order: {
  reference: string;
  customerEmail: string;
  customerName: string;
  status: string;
}) {
  const STATUS_LABELS: Record<string, { label: string; message: string; emoji: string }> = {
    paid:      { label: "Paiement reçu",   message: "Votre paiement a été confirmé. Nous préparons votre commande.",         emoji: "✅" },
    preparing: { label: "En préparation",  message: "Votre commande est en cours de préparation par notre équipe.",          emoji: "📦" },
    shipped:   { label: "Expédiée",        message: "Votre commande est en route ! Vous la recevrez très bientôt.",           emoji: "🚚" },
    delivered: { label: "Livrée",          message: "Votre commande a été livrée. Bonne utilisation !",                      emoji: "🎉" },
    cancelled: { label: "Annulée",         message: "Votre commande a été annulée. Contactez-nous pour plus d'informations.", emoji: "❌" },
  };

  const info = STATUS_LABELS[order.status] || { label: order.status, message: "", emoji: "📋" };

  const html = `
<!DOCTYPE html>
<html lang="fr">
<body style="margin:0;padding:0;background:#faf8f5;font-family:Georgia,'Times New Roman',serif">
  <div style="max-width:560px;margin:0 auto;padding:32px 16px">
    <div style="background:linear-gradient(135deg,#1a1008 0%,#2c1c06 100%);border-radius:16px 16px 0 0;padding:32px;text-align:center">
      <p style="margin:0;font-size:32px">${info.emoji}</p>
      <h1 style="margin:8px 0 0;font-size:22px;font-weight:700;color:#fff">${info.label}</h1>
      <p style="margin:8px 0 0;font-size:13px;color:rgba(253,230,138,0.80)">Commande ${order.reference}</p>
    </div>
    <div style="background:#fff;padding:32px;border:1px solid rgba(217,119,6,0.15);text-align:center">
      <p style="font-size:15px;color:#1a1008;line-height:1.7">Bonjour ${order.customerName},</p>
      <p style="font-size:14px;color:#4b5563;line-height:1.7">${info.message}</p>
      <a href="${SITE_URL}/commande/${order.reference}" style="display:inline-block;background:linear-gradient(135deg,#d97706,#f59e0b);color:#fff;font-weight:700;font-size:14px;padding:12px 28px;border-radius:8px;text-decoration:none;margin-top:16px">
        Voir ma commande
      </a>
    </div>
    <div style="background:#1a1008;border-radius:0 0 16px 16px;padding:16px 32px;text-align:center">
      <p style="margin:0;font-size:11px;color:rgba(255,255,255,0.30)">© SILVIO STORE · contact@silviostore.com · +228 92 60 25 19</p>
    </div>
  </div>
</body>
</html>`;

  return resend.emails.send({
    from: FROM,
    to: order.customerEmail,
    subject: `${info.emoji} Commande ${order.reference} — ${info.label}`,
    html,
  });
}
