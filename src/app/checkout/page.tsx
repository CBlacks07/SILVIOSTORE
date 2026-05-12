import { sql } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { getSetting } from "@/lib/settings";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";

export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const shipping = await getSetting("shipping");
  const user = await getCurrentUser();
  const isFedaPaySandbox = (process.env.FEDAPAY_ENVIRONMENT || "sandbox") !== "live";

  const defaultAddress = user
    ? (
        await sql<
          {
            full_name: string;
            phone: string;
            country: string;
            city: string;
            district: string | null;
            details: string;
          }[]
        >`
          select full_name, phone, country, city, district, details
          from addresses
          where user_id = ${user.id}
          order by is_default desc, created_at desc
          limit 1
        `
      )[0] ?? null
    : null;

  return (
    <CheckoutForm
      shipping={shipping}
      isFedaPaySandbox={isFedaPaySandbox}
      initialUser={
        user
          ? {
              fullName: user.full_name || "",
              phone: user.phone || "",
              email: user.email
            }
          : null
      }
      initialAddress={
        defaultAddress
          ? {
              fullName: defaultAddress.full_name,
              phone: defaultAddress.phone,
              country: defaultAddress.country,
              city: defaultAddress.city,
              district: defaultAddress.district || "",
              details: defaultAddress.details
            }
          : null
      }
    />
  );
}
