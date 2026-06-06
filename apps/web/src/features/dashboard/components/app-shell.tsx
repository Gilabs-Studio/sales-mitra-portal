"use client";

import { BarChart3, BookOpen, LayoutDashboard, LogOut, Send, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, usePathname } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import { useLogout } from "@/features/auth/hooks/use-auth";
import type { User } from "@/features/auth/types/auth.types";

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
};

type AppShellProps = {
  user: User;
  children: React.ReactNode;
};

const partnerNav: NavItem[] = [
  { href: "/partner", label: "Dashboard", icon: LayoutDashboard },
  { href: "/partner/leads", label: "Lead", icon: Send },
  { href: "/partner/knowledge", label: "Knowledge", icon: BookOpen },
];

const adminNav: NavItem[] = [
  { href: "/admin", label: "Dashboard", icon: Shield },
  { href: "/admin/leads", label: "Lead", icon: BarChart3 },
];

export function AppShell({ user, children }: AppShellProps) {
  const pathname = usePathname();
  const logout = useLogout();
  const items = user.role === "admin" ? adminNav : partnerNav;

  return (
    <main className="min-h-screen bg-background">
      <header className="border-b border-border bg-background">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-4 md:flex-row md:items-center md:justify-between">
          <div>
            <Link href="/" className="text-lg font-extrabold text-foreground">
              GiLabs Mitra Portal
            </Link>
            <p className="text-xs text-muted-foreground">
              {user.name} · {user.role === "admin" ? "Admin" : user.partnerCode}
            </p>
          </div>
          <nav className="flex flex-wrap items-center gap-2">
            {items.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "inline-flex min-h-10 items-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0",
                    active ? "border-primary bg-primary text-primary-foreground" : "border-border bg-secondary text-foreground",
                  )}
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                  {item.label}
                </Link>
              );
            })}
            <Button type="button" variant="ghost" onClick={logout}>
              <LogOut className="h-4 w-4" aria-hidden="true" />
              Keluar
            </Button>
          </nav>
        </div>
      </header>
      <div className="mx-auto max-w-7xl px-5 py-8">{children}</div>
    </main>
  );
}
