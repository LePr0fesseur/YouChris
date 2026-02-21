import { prisma } from "@/lib/prisma";
import { getMonthlyRevenue } from "@/lib/stripe";
import { YouTubeSyncButton } from "@/components/admin/YouTubeSyncButton";
import { Users, Video, Crown, Euro, RefreshCw } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard Admin",
};

export const dynamic = "force-dynamic";

async function getStats() {
  const [totalVideos, premiumVideos, totalUsers, activeSubscriptions] =
    await Promise.all([
      prisma.video.count({ where: { status: { not: "DRAFT" } } }),
      prisma.video.count({ where: { status: "PREMIUM" } }),
      prisma.user.count(),
      prisma.subscription.count({ where: { status: "ACTIVE" } }),
    ]);

  let monthlyRevenue = 0;
  try {
    monthlyRevenue = await getMonthlyRevenue();
  } catch {
    // Stripe non configuré en dev
  }

  const lastSync = await prisma.activityLog.findFirst({
    where: { action: "YOUTUBE_SYNC" },
    orderBy: { createdAt: "desc" },
  });

  const recentActivity = await prisma.activityLog.findMany({
    include: { user: { select: { email: true, name: true } } },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  return {
    totalVideos,
    premiumVideos,
    totalUsers,
    activeSubscriptions,
    monthlyRevenue,
    lastSync,
    recentActivity,
  };
}

export default async function AdminDashboard() {
  const stats = await getStats();

  const statsCards = [
    {
      label: "Vidéos totales",
      value: stats.totalVideos,
      sub: `dont ${stats.premiumVideos} premium`,
      icon: Video,
      color: "text-indigo-400",
      bg: "bg-indigo-400/10",
    },
    {
      label: "Utilisateurs",
      value: stats.totalUsers,
      sub: "inscrits",
      icon: Users,
      color: "text-cyan-400",
      bg: "bg-cyan-400/10",
    },
    {
      label: "Abonnés actifs",
      value: stats.activeSubscriptions,
      sub: "premium",
      icon: Crown,
      color: "text-amber-400",
      bg: "bg-amber-400/10",
    },
    {
      label: "Revenus du mois",
      value: `${stats.monthlyRevenue.toFixed(2)}€`,
      sub: "ce mois-ci",
      icon: Euro,
      color: "text-green-400",
      bg: "bg-green-400/10",
    },
  ];

  return (
    <div className="p-6 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[var(--foreground)]">
          Dashboard
        </h1>
        <YouTubeSyncButton lastSync={stats.lastSync?.createdAt} />
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((card) => (
          <div key={card.label} className="glass rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-9 h-9 rounded-lg ${card.bg} flex items-center justify-center`}>
                <card.icon className={`w-4 h-4 ${card.color}`} aria-hidden="true" />
              </div>
              <span className="text-sm text-[var(--muted)]">{card.label}</span>
            </div>
            <p className="text-2xl font-bold text-[var(--foreground)]">
              {card.value}
            </p>
            <p className="text-xs text-[var(--muted)] mt-0.5">{card.sub}</p>
          </div>
        ))}
      </div>

      {/* Activité récente */}
      <div>
        <h2 className="text-lg font-semibold text-[var(--foreground)] mb-4">
          Activité récente
        </h2>
        <div className="glass rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th className="text-left px-4 py-3 text-[var(--muted)] font-medium">
                  Action
                </th>
                <th className="text-left px-4 py-3 text-[var(--muted)] font-medium hidden sm:table-cell">
                  Utilisateur
                </th>
                <th className="text-left px-4 py-3 text-[var(--muted)] font-medium">
                  Date
                </th>
              </tr>
            </thead>
            <tbody>
              {stats.recentActivity.map((log) => (
                <tr
                  key={log.id}
                  className="border-b border-[var(--border)]/50 hover:bg-[var(--border)]/10 transition-colors"
                >
                  <td className="px-4 py-3 text-[var(--foreground)]">
                    <code className="text-xs px-1.5 py-0.5 rounded bg-[var(--surface)] text-[var(--accent)]">
                      {log.action}
                    </code>
                  </td>
                  <td className="px-4 py-3 text-[var(--muted)] hidden sm:table-cell">
                    {log.user?.email || "Système"}
                  </td>
                  <td className="px-4 py-3 text-[var(--muted)] text-xs">
                    {new Date(log.createdAt).toLocaleString("fr-FR")}
                  </td>
                </tr>
              ))}
              {stats.recentActivity.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-4 py-8 text-center text-[var(--muted)]">
                    Aucune activité récente.
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
