import Link from "next/link";
import { redirect } from "next/navigation";
import { LogOut, MapPin, Package, User, ChevronRight } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { SignOutButton } from "@/components/auth/SignOutButton";

const NAV = [
  { href: "/compte",           label: "Mon profil",   icon: User },
  { href: "/compte/commandes", label: "Mes commandes", icon: Package },
  { href: "/compte/adresses",  label: "Mes adresses", icon: MapPin },
];

export default async function AccountLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/connexion?redirect=/compte");

  const initials = user.full_name
    ? user.full_name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase()
    : user.email.slice(0, 2).toUpperCase();

  return (
    <div className="container-page py-10">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-1.5 text-xs text-brand-500">
        <Link href="/" className="hover:text-brand-900">Accueil</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-brand-700 font-medium">Mon compte</span>
      </nav>

      <div className="grid lg:grid-cols-[280px,1fr] gap-8 items-start">
        {/* Sidebar */}
        <aside className="space-y-3">
          {/* User card */}
          <div className="card p-5">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-brand-950 text-white grid place-items-center text-sm font-bold shrink-0">
                {initials}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-brand-950 truncate">
                  {user.full_name || "Mon compte"}
                </p>
                <p className="text-xs text-brand-500 truncate">{user.email}</p>
              </div>
            </div>
            {user.role === "admin" && (
              <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-accent/10 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-accent">
                Administrateur
              </div>
            )}
          </div>

          {/* Nav */}
          <div className="card p-2">
            <nav className="space-y-0.5">
              {NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-brand-700 hover:bg-brand-50 hover:text-brand-950 transition-colors"
                >
                  <item.icon className="h-4 w-4 text-brand-400 shrink-0" />
                  {item.label}
                </Link>
              ))}
              <div className="border-t border-brand-100 my-1 mx-1" />
              <SignOutButton className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-rose-600 hover:bg-rose-50 transition-colors">
                <LogOut className="h-4 w-4 shrink-0" />
                Se déconnecter
              </SignOutButton>
            </nav>
          </div>

          {user.role === "admin" && (
            <Link
              href="/admin"
              className="card p-4 flex items-center justify-between text-sm text-brand-700 hover:text-accent hover:border-accent/30 transition-all"
            >
              <span className="font-medium">Accès administration</span>
              <ChevronRight className="h-4 w-4 shrink-0" />
            </Link>
          )}
        </aside>

        {/* Content */}
        <div>{children}</div>
      </div>
    </div>
  );
}
