import Link from "next/link";
import { Shield } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2 mb-8 group">
        <div className="w-10 h-10 rounded-xl bg-[var(--accent)] flex items-center justify-center group-hover:scale-110 transition-transform">
          <Shield className="w-5 h-5 text-white" aria-hidden="true" />
        </div>
        <span className="text-xl font-bold text-[var(--foreground)]">
          Les Vidéos de Chris
        </span>
      </Link>

      {children}

      <p className="mt-8 text-xs text-[var(--muted)] text-center">
        En continuant, vous acceptez nos{" "}
        <Link href="/cgu" className="text-[var(--accent)] hover:underline">
          CGU
        </Link>{" "}
        et notre{" "}
        <Link
          href="/politique-confidentialite"
          className="text-[var(--accent)] hover:underline"
        >
          politique de confidentialité
        </Link>
        .
      </p>
    </div>
  );
}
