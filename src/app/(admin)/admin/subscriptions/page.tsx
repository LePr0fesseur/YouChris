import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Abonnements — Admin",
};

export const dynamic = "force-dynamic";

export default async function AdminSubscriptionsPage() {
  const subscriptions = await prisma.subscription.findMany({
    include: {
      user: { select: { email: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const stats = {
    active: subscriptions.filter((s) => s.status === "ACTIVE").length,
    cancelled: subscriptions.filter((s) => s.status === "CANCELLED").length,
    pastDue: subscriptions.filter((s) => s.status === "PAST_DUE").length,
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-[var(--foreground)]">
        Abonnements
      </h1>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-3 gap-4">
        <div className="glass rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-[var(--success)]">{stats.active}</p>
          <p className="text-xs text-[var(--muted)] mt-1">Actifs</p>
        </div>
        <div className="glass rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-[var(--danger)]">{stats.pastDue}</p>
          <p className="text-xs text-[var(--muted)] mt-1">Paiement en retard</p>
        </div>
        <div className="glass rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-[var(--muted)]">{stats.cancelled}</p>
          <p className="text-xs text-[var(--muted)] mt-1">Annulés</p>
        </div>
      </div>

      <div className="glass rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th className="text-left px-4 py-3 text-[var(--muted)] font-medium">Utilisateur</th>
                <th className="text-left px-4 py-3 text-[var(--muted)] font-medium">Statut</th>
                <th className="text-left px-4 py-3 text-[var(--muted)] font-medium hidden md:table-cell">Début</th>
                <th className="text-left px-4 py-3 text-[var(--muted)] font-medium hidden md:table-cell">Fin</th>
              </tr>
            </thead>
            <tbody>
              {subscriptions.map((sub) => (
                <tr
                  key={sub.id}
                  className="border-b border-[var(--border)]/50 hover:bg-[var(--border)]/10 transition-colors"
                >
                  <td className="px-4 py-3">
                    <p className="text-[var(--foreground)]">{sub.user.email}</p>
                    {sub.user.name && (
                      <p className="text-xs text-[var(--muted)]">{sub.user.name}</p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant={
                        sub.status === "ACTIVE"
                          ? "success"
                          : sub.status === "PAST_DUE"
                          ? "danger"
                          : "secondary"
                      }
                    >
                      {sub.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-[var(--muted)] text-xs hidden md:table-cell">
                    {formatDate(sub.currentPeriodStart)}
                  </td>
                  <td className="px-4 py-3 text-[var(--muted)] text-xs hidden md:table-cell">
                    {formatDate(sub.currentPeriodEnd)}
                  </td>
                </tr>
              ))}
              {subscriptions.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-12 text-center text-[var(--muted)]">
                    Aucun abonnement.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
