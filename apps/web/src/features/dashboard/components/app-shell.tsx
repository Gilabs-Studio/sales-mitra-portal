"use client";

import { BarChart3, BookOpen, LayoutDashboard, LogOut, Send, Settings2, Shield, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, usePathname } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import { useLogout } from "@/features/auth/hooks/use-auth";
import type { User } from "@/features/auth/types/auth.types";
import { useUnreadCount } from "@/features/leads/hooks/use-leads";

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
};

type AppShellProps = {
  user: User;
  children: React.ReactNode;
  noPadding?: boolean;
};

const partnerNav: NavItem[] = [
  { href: "/partner", label: "Dashboard", icon: LayoutDashboard },
  { href: "/partner/leads", label: "Lead", icon: Send },
  { href: "/partner/chat", label: "Chat", icon: MessageSquare },
  { href: "/partner/knowledge", label: "Knowledge", icon: BookOpen },
];

const adminNav: NavItem[] = [
  { href: "/admin", label: "Dashboard", icon: Shield },
  { href: "/admin/leads", label: "Lead", icon: BarChart3 },
  { href: "/admin/chat", label: "Chat", icon: MessageSquare },
  { href: "/admin/services", label: "Layanan", icon: Settings2 },
];

export function AppShell({ user, children, noPadding }: AppShellProps) {
  const pathname = usePathname();
  const logout = useLogout();
  const items = user.role === "admin" ? adminNav : partnerNav;
  const unreadQuery = useUnreadCount(user.role);

  const totalUnread = unreadQuery.data?.data.reduce((acc, lead) => acc + lead.unreadCount, 0) ?? 0;

  return (
    <main className={cn("flex min-h-screen flex-col bg-background", noPadding && "h-screen min-h-0 overflow-hidden")}>
      <header className="border-b border-border bg-background shrink-0">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-4 md:flex-row md:items-center md:justify-between">
          <div>
            <Link href="/" className="text-lg font-extrabold text-foreground animate-pulse">
              GiLabs Mitra Portal
            </Link>
            <p className="text-xs text-muted-foreground">
              {user.name} · {user.role === "admin" ? "Admin" : user.partnerCode}
            </p>
          </div>
          <nav className="flex flex-wrap items-center gap-2">
            {items.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href || (item.href !== "/partner" && item.href !== "/admin" && pathname.startsWith(item.href));
              const isChat = item.label === "Chat";
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "relative inline-flex min-h-10 items-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer",
                    active ? "border-primary bg-primary text-primary-foreground" : "border-border bg-secondary text-foreground",
                  )}
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                  {item.label}
                  {isChat && totalUnread > 0 && (
                    <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1.5 text-[10px] font-bold text-white shadow-md">
                      {totalUnread > 99 ? "99+" : totalUnread}
                    </span>
                  )}
                </Link>
              );
            })}
            <Button type="button" variant="ghost" onClick={logout} className="cursor-pointer">
              <LogOut className="h-4 w-4" aria-hidden="true" />
              Keluar
            </Button>
          </nav>
        </div>
      </header>
      <div className={cn("mx-auto w-full max-w-7xl px-5 py-8 flex-1 flex flex-col overflow-hidden", noPadding && "max-w-none px-0 py-0")}>
        {children}
      </div>
    </main>
  );
}
