"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Shield, Menu, X, ChevronDown, LogOut, User, Settings, Crown } from "lucide-react";

export function Header() {
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const isAdmin = session?.user?.role === "ADMIN";
  const isPremium = session?.user?.subscriptionStatus === "ACTIVE";

  return (
    <header className="sticky top-0 z-50 glass border-b border-[var(--border)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-[var(--accent)] flex items-center justify-center group-hover:scale-110 transition-transform">
              <Shield className="w-4 h-4 text-white" aria-hidden="true" />
            </div>
            <span className="font-bold text-[var(--foreground)] hidden sm:block">
              Les Vidéos de Chris
            </span>
          </Link>

          {/* Navigation desktop */}
          <nav className="hidden md:flex items-center gap-6" aria-label="Navigation principale">
            <Link
              href="/videos"
              className="text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
            >
              Vidéos
            </Link>
            <Link
              href="/premium"
              className="text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition-colors flex items-center gap-1"
            >
              <Crown className="w-3.5 h-3.5 text-amber-400" aria-hidden="true" />
              Premium
            </Link>
            {isAdmin && (
              <Link
                href="/admin"
                className="text-sm text-[var(--accent)] hover:text-indigo-400 transition-colors"
              >
                Admin
              </Link>
            )}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {session ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
                  aria-expanded={userMenuOpen}
                  aria-haspopup="menu"
                >
                  <div className="w-8 h-8 rounded-full bg-[var(--accent)] flex items-center justify-center text-white font-bold text-xs">
                    {session.user.name?.[0]?.toUpperCase() || session.user.email[0]?.toUpperCase()}
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 hidden sm:block" aria-hidden="true" />
                </button>

                {userMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setUserMenuOpen(false)}
                      aria-hidden="true"
                    />
                    <div
                      className="absolute right-0 top-10 z-50 w-52 rounded-xl bg-[var(--surface)] border border-[var(--border)] shadow-xl py-1"
                      role="menu"
                    >
                      <div className="px-4 py-2.5 border-b border-[var(--border)]">
                        <p className="text-xs text-[var(--muted)]">Connecté en tant que</p>
                        <p className="text-sm font-medium text-[var(--foreground)] truncate">
                          {session.user.email}
                        </p>
                        {isPremium && (
                          <span className="badge-premium inline-block mt-1">Premium</span>
                        )}
                      </div>
                      <Link
                        href="/member/dashboard"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--border)]/20 transition-colors"
                        role="menuitem"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <User className="w-4 h-4" aria-hidden="true" />
                        Mon espace
                      </Link>
                      <Link
                        href="/member/account"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--border)]/20 transition-colors"
                        role="menuitem"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <Settings className="w-4 h-4" aria-hidden="true" />
                        Paramètres
                      </Link>
                      {isAdmin && (
                        <Link
                          href="/admin"
                          className="flex items-center gap-2 px-4 py-2 text-sm text-[var(--accent)] hover:bg-[var(--border)]/20 transition-colors"
                          role="menuitem"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <Shield className="w-4 h-4" aria-hidden="true" />
                          Administration
                        </Link>
                      )}
                      <div className="border-t border-[var(--border)] mt-1">
                        <button
                          onClick={() => {
                            setUserMenuOpen(false);
                            signOut({ callbackUrl: "/" });
                          }}
                          className="flex items-center gap-2 w-full px-4 py-2 text-sm text-[var(--danger)] hover:bg-[var(--border)]/20 transition-colors"
                          role="menuitem"
                        >
                          <LogOut className="w-4 h-4" aria-hidden="true" />
                          Se déconnecter
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/login">Connexion</Link>
                </Button>
                <Button size="sm" asChild className="hidden sm:inline-flex">
                  <Link href="/register">S&apos;inscrire</Link>
                </Button>
              </>
            )}

            {/* Bouton menu mobile */}
            <button
              className="md:hidden p-2 text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-expanded={mobileMenuOpen}
              aria-label="Menu de navigation"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" aria-hidden="true" />
              ) : (
                <Menu className="w-5 h-5" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Menu mobile */}
      {mobileMenuOpen && (
        <nav
          className="md:hidden border-t border-[var(--border)] bg-[var(--surface)]"
          aria-label="Navigation mobile"
        >
          <div className="px-4 py-3 space-y-1">
            <Link
              href="/videos"
              className="block px-3 py-2 text-sm text-[var(--muted)] hover:text-[var(--foreground)] rounded-lg hover:bg-[var(--border)]/20 transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Vidéos
            </Link>
            <Link
              href="/premium"
              className="block px-3 py-2 text-sm text-[var(--muted)] hover:text-[var(--foreground)] rounded-lg hover:bg-[var(--border)]/20 transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Premium
            </Link>
            {!session && (
              <>
                <Link
                  href="/login"
                  className="block px-3 py-2 text-sm text-[var(--muted)] hover:text-[var(--foreground)] rounded-lg hover:bg-[var(--border)]/20 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Connexion
                </Link>
                <Link
                  href="/register"
                  className="block px-3 py-2 text-sm text-[var(--accent)] font-medium rounded-lg hover:bg-[var(--border)]/20 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  S&apos;inscrire
                </Link>
              </>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
