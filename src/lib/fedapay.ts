const BASE_URL =
  (process.env.FEDAPAY_ENVIRONMENT || "sandbox") === "live"
    ? "https://api.fedapay.com/v1"
    : "https://sandbox-api.fedapay.com/v1";

type CreateTransactionInput = {
  amount: number;
  description: string;
  reference: string;
  callbackUrl: string;
  customer: {
    firstname: string;
    lastname: string;
    email: string;
    phone: string;
    countryIso: string;
  };
};

export type FedaPayTransaction = {
  id: number;
  reference: string;
  status: string;
  amount: number;
  description: string;
  metadata: Record<string, unknown>;
};

async function fedapayFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const key = process.env.FEDAPAY_SECRET_KEY;
  if (!key) throw new Error("FEDAPAY_SECRET_KEY is missing");

  const res = await fetch(BASE_URL + path, {
    ...init,
    headers: {
      Authorization: "Bearer " + key,
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(init.headers || {})
    },
    cache: "no-store"
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error("FedaPay " + res.status + ": " + body);
  }
  return (await res.json()) as T;
}

export async function createFedaPayCheckout(input: CreateTransactionInput): Promise<{
  transactionId: number;
  paymentUrl: string;
  reference: string;
}> {
  const created = await fedapayFetch<{ "v1/transaction": FedaPayTransaction }>(
    "/transactions",
    {
      method: "POST",
      body: JSON.stringify({
        description: input.description,
        amount: input.amount,
        currency: { iso: "XOF" },
        callback_url: input.callbackUrl,
        custom_metadata: { order_reference: input.reference },
        customer: {
          firstname: input.customer.firstname,
          lastname: input.customer.lastname,
          email: input.customer.email,
          phone_number: { number: input.customer.phone, country: input.customer.countryIso }
        }
      })
    }
  );

  const transaction = created["v1/transaction"];

  const token = await fedapayFetch<{ url: string; token: string }>(
    "/transactions/" + transaction.id + "/token",
    { method: "POST" }
  );

  return { transactionId: transaction.id, paymentUrl: token.url, reference: transaction.reference };
}

export async function getFedaPayTransaction(id: number): Promise<FedaPayTransaction> {
  const res = await fedapayFetch<{ "v1/transaction": FedaPayTransaction }>("/transactions/" + id);
  return res["v1/transaction"];
}

export const COUNTRY_TO_ISO: Record<string, string> = {
  Togo: "tg",
  "Bénin": "bj",
  Benin: "bj",
  "Côte d'Ivoire": "ci",
  "Cote d'Ivoire": "ci",
  "Burkina Faso": "bf",
  "Sénégal": "sn",
  Senegal: "sn",
  Mali: "ml",
  Ghana: "gh",
  Niger: "ne",
  "Guinée": "gn",
  Guinee: "gn",
  Nigeria: "ng"
};
