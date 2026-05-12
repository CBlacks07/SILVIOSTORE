import { getCurrentUser } from "@/lib/auth";
import { ProfileForm } from "@/components/account/ProfileForm";

export default async function ProfilePage() {
  const user = (await getCurrentUser())!;

  return (
    <ProfileForm
      initial={{
        full_name: user.full_name,
        phone: user.phone,
        email: user.email,
        role: user.role
      }}
    />
  );
}
