type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
  text: string;
};

const RESEND_API = "https://api.resend.com/emails";

async function sendWithResend(input: SendEmailInput): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return false;

  const from = process.env.RESEND_FROM_EMAIL || "SILVIO STORE <no-reply@silviostore.com>";

  const res = await fetch(RESEND_API, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from,
      to: [input.to],
      subject: input.subject,
      html: input.html,
      text: input.text
    }),
    cache: "no-store"
  });

  if (!res.ok) {
    const body = await res.text();
    console.error("[mail] Resend error", res.status, body);
    return false;
  }

  return true;
}

export async function sendPasswordResetEmail(input: {
  to: string;
  fullName?: string | null;
  resetUrl: string;
}) {
  const firstName = input.fullName?.trim()?.split(" ")[0] || "Client";
  const subject = "Réinitialisation de votre mot de passe";
  const text = [
    `Bonjour ${firstName},`,
    "",
    "Nous avons reçu une demande de réinitialisation de mot de passe.",
    "Utilisez ce lien (valide 30 minutes) :",
    input.resetUrl,
    "",
    "Si vous n'êtes pas à l'origine de cette demande, ignorez ce message."
  ].join("\n");

  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.5;color:#0f172a">
      <p>Bonjour <strong>${firstName}</strong>,</p>
      <p>Nous avons reçu une demande de réinitialisation de mot de passe.</p>
      <p>
        <a href="${input.resetUrl}" style="display:inline-block;padding:10px 14px;background:#0ea5e9;color:#fff;text-decoration:none;border-radius:8px;">
          Réinitialiser mon mot de passe
        </a>
      </p>
      <p>Ce lien est valide pendant <strong>30 minutes</strong>.</p>
      <p style="font-size:12px;color:#475569">Si vous n'êtes pas à l'origine de cette demande, ignorez ce message.</p>
    </div>
  `;

  return sendWithResend({ to: input.to, subject, html, text });
}
