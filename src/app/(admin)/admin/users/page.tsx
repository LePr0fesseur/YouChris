import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Gestion des utilisateurs — Admin",
};

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    include: { subscription: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-[var(--foreground)]">
        Utilisateurs ({users.length})
      </h1>

      <div className="glass rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th className="text-left px-4 py-3 text-[var(--muted)] font-medium">Email</th>
                <th className="text-left px-4 py-3 text-[var(--muted)] font-medium hidden sm:table-cell">Rôle</th>
                <th className="text-left px-4 py-3 text-[var(--muted)] font-medium">Abonnement</th>
                <th className="text-left px-4 py-3 text-[var(--muted)] font-medium hidden lg:table-cell">Inscrit le</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => {
                const isActive = user.subscription?.status === "ACTIVE";
                return (
                  <tr
                    key={user.id}
                    className="border-b border-[var(--border)]/50 hover:bg-[var(--border)]/10 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-[var(--foreground)] font-medium">
                          {user.email}
                        </p>
                        {user.name && (
                          <p className="text-xs text-[var(--muted)]">{user.name}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <Badge variant={user.role === "ADMIN" ? "default" : "secondary"}>
                        {user.role}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      {user.subscription ? (
                        <Badge
                          variant={
                            isActive
                              ? "success"
                              : user.subscription.status === "PAST_DUE"
                              ? "danger"
                              : "secondary"
                          }
                        >
                          {user.subscription.status}
                        </Badge>
                      ) : (
                        <span className="text-[var(--muted)] text-xs">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-[var(--muted)] text-xs hidden lg:table-cell">
                      {formatDate(user.createdAt)}
                    </td>
                  </tr>
                );
              })}
              {users.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-12 text-center text-[var(--muted)]">
                    Aucun utilisateur.
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
