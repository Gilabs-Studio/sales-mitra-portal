import * as React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  isLoading?: boolean;
};

const variants: Record<ButtonVariant, string> = {
  primary: "bg-primary text-primary-foreground border-primary hover:shadow-primary/20",
  secondary: "bg-secondary text-secondary-foreground border-border hover:bg-[#e8e6dc]",
  ghost: "bg-transparent text-foreground border-transparent hover:bg-secondary",
  danger: "bg-destructive text-primary-foreground border-destructive hover:shadow-destructive/20",
};

export function Button({
  className,
  variant = "primary",
  isLoading = false,
  disabled,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border px-4 py-2 text-sm font-semibold transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 disabled:pointer-events-none disabled:opacity-60",
        variants[variant],
        className,
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
      {children}
    </button>
  );
}
