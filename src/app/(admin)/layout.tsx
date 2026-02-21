import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Shield, LayoutDashboard, Video, Users, CreditCard, FileText, RefreshCw } from "lucide-react";

const adminNav = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/videos", label: "Vidéos", icon: Video },
  { href: "/admin/users", label: "Utilisateurs", icon: Users },
  { href: "/admin/subscriptions", label: "Abonnements", icon: CreditCard },
  { href: "/admin/logs", label: "Logs", icon: FileText },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/member/dashboard");
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar admin */}
      <aside className="w-60 shrink-0 border-r border-[var(--border)] bg-[var(--surface)] hidden md:flex flex-col">
        {/* Logo */}
        <div className="h-16 flex items-center gap-2 px-5 border-b border-[var(--border)]">
          <Shield className="w-5 h-5 text-[var(--accent)]" aria-hidden="true" />
          <span className="font-semibold text-[var(--foreground)] text-sm">
            Administration
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1" aria-label="Navigation admin">
          {adminNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--border)]/30 transition-colors"
            >
              <item.icon className="w-4 h-4 shrink-0" aria-hidden="true" />
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Lien vers le site */}
        <div className="p-3 border-t border-[var(--border)]">
          <Link
            href="/"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
          >
            ← Retour au site
          </Link>
        </div>
      </aside>

      {/* Contenu */}
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
