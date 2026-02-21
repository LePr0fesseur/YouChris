import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors",
  {
    variants: {
      variant: {
        default: "bg-[var(--accent)] text-white",
        secondary: "bg-[var(--surface)] border border-[var(--border)] text-[var(--muted)]",
        premium: "bg-gradient-to-r from-amber-500 to-red-500 text-white",
        success: "bg-[var(--success)]/20 text-[var(--success)] border border-[var(--success)]/30",
        danger: "bg-[var(--danger)]/20 text-[var(--danger)] border border-[var(--danger)]/30",
        outline: "border border-[var(--border)] text-[var(--foreground)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
