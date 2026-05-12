import { getSetting } from "@/lib/settings";

export async function getShippingFor(country: string): Promise<{ cost: number; eta: string }> {
  const settings = await getSetting("shipping");
  const cost = settings.fees[country] ?? settings.default_fee;
  const eta = cost <= 2000 ? "1 à 2 jours" : cost <= 5500 ? "3 à 5 jours" : "5 à 10 jours";
  return { cost, eta };
}
