import { sql } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { AddressBook } from "@/components/account/AddressBook";
import type { Address } from "@/lib/types";

export default async function AddressesPage() {
  const user = (await getCurrentUser())!;
  const addresses = await sql<Address[]>`
    select * from addresses where user_id = ${user.id} order by is_default desc, created_at desc
  `;

  return <AddressBook initial={addresses} />;
}
