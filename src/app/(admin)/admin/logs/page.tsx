import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Logs d'activité — Admin",
};

export const dynamic = "force-dynamic";

export default async function AdminLogsPage() {
  const logs = await prisma.activityLog.findMany({
    include: { user: { select: { email: true } } },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-[var(--foreground)]">
        Logs d&apos;activité
      </h1>

      <div className="glass rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th className="text-left px-4 py-3 text-[var(--muted)] font-medium">Action</th>
                <th className="text-left px-4 py-3 text-[var(--muted)] font-medium hidden sm:table-cell">Utilisateur</th>
                <th className="text-left px-4 py-3 text-[var(--muted)] font-medium hidden md:table-cell">IP</th>
                <th className="text-left px-4 py-3 text-[var(--muted)] font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr
                  key={log.id}
                  className="border-b border-[var(--border)]/50 hover:bg-[var(--border)]/10 transition-colors"
                >
                  <td className="px-4 py-3">
                    <code className="text-xs px-1.5 py-0.5 rounded bg-[var(--surface)] text-[var(--accent)]">
                      {log.action}
                    </code>
                    {log.details && (
                      <pre className="text-xs text-[var(--muted)] mt-1 max-w-xs truncate">
                        {JSON.stringify(log.details)}
                      </pre>
                    )}
                  </td>
                  <td className="px-4 py-3 text-[var(--muted)] text-xs hidden sm:table-cell">
                    {log.user?.email || "Système"}
                  </td>
                  <td className="px-4 py-3 text-[var(--muted)] text-xs hidden md:table-cell">
                    {log.ipAddress || "—"}
                  </td>
                  <td className="px-4 py-3 text-[var(--muted)] text-xs">
                    {new Date(log.createdAt).toLocaleString("fr-FR")}
                  </td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-12 text-center text-[var(--muted)]">
                    Aucun log.
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
