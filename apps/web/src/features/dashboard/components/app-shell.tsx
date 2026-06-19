"use client";

import * as React from "react";
import Image from "next/image";
import { Bell, Download, KeyRound, LogOut, Menu, Smartphone, X } from "lucide-react";
import { Link, usePathname } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import { useLeadEmailNotificationPreference, useLogout } from "@/features/auth/hooks/use-auth";
import { isAdminRole, type User } from "@/features/auth/types/auth.types";
import { useUnreadCount } from "@/features/leads/hooks/use-leads";

type NavItem = {
  href: string;
  label: string;
  superAdminOnly?: boolean;
};

type AppShellProps = {
  user: User;
  children: React.ReactNode;
  noPadding?: boolean;
};

const partnerNav: NavItem[] = [
  { href: "/partner", label: "Dashboard" },
  { href: "/partner/leads", label: "Lead" },
  { href: "/partner/chat", label: "Chat" },
  { href: "/partner/knowledge", label: "Knowledge" },
];

const adminNav: NavItem[] = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/leads", label: "Lead" },
  { href: "/admin/clients", label: "Klien" },
  { href: "/admin/chat", label: "Chat" },
  { href: "/admin/services", label: "Layanan" },
  { href: "/admin/partners", label: "Mitra" },
  { href: "/admin/admins", label: "Admin", superAdminOnly: true },
];

const clientNav: NavItem[] = [
  { href: "/client", label: "Dashboard" },
  { href: "/client/projects", label: "Project" },
];

export function AppShell({ user, children, noPadding }: Readonly<AppShellProps>) {
  const pathname = usePathname();
  const logout = useLogout();
  const adminScope = isAdminRole(user.role);
  const leadEmailPreference = useLeadEmailNotificationPreference();
  const items = adminScope
    ? adminNav.filter((item) => !item.superAdminOnly || user.role === "super_admin")
    : user.role === "client"
    ? clientNav
    : partnerNav;
  const unreadQuery = useUnreadCount(adminScope ? "admin" : "partner", user.role !== "client");
  const mobileDownloadUrl = process.env.NEXT_PUBLIC_MOBILE_APP_DOWNLOAD_URL;
  const mobileDownloadHref = "/downloads/mobile-app";

  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [profileOpen, setProfileOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  const totalUnread = user.role !== "client"
    ? (unreadQuery.data?.data?.reduce((acc, lead) => acc + lead.unreadCount, 0) ?? 0)
    : 0;

  const handleLeadNotificationToggle = React.useCallback(() => {
    if (!adminScope || leadEmailPreference.isPending) return;
    leadEmailPreference.mutate(!user.leadEmailNotificationsEnabled);
  }, [adminScope, leadEmailPreference, user.leadEmailNotificationsEnabled]);

  React.useEffect(() => {
    setMobileMenuOpen(false);
    setProfileOpen(false);
  }, [pathname]);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <main className={cn("flex min-h-screen flex-col bg-background", noPadding && "h-screen min-h-0 overflow-hidden")}>
      <header className="sticky top-0 z-50 shrink-0 border-b border-border/40 bg-background/95 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-3 px-4 sm:px-6">
          <Link href="/" className="inline-flex cursor-pointer items-center gap-2 transition-opacity hover:opacity-80">
            <Image
              src="/Logo.png"
              alt="GiLabs"
              width={88}
              height={28}
              className="h-5 w-auto object-contain sm:h-6"
              priority
            />
          </Link>

          <div className="hidden items-center gap-6 lg:flex">
            {mobileDownloadUrl ? (
              <a
                href={mobileDownloadHref}
                className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-xs font-semibold text-foreground transition-all duration-200 hover:bg-secondary"
              >
                <Smartphone className="h-3.5 w-3.5" aria-hidden="true" />
                Download App
                <Download className="h-3.5 w-3.5" aria-hidden="true" />
              </a>
            ) : null}
            <nav className="flex items-center gap-5">
              {items.map((item) => {
                const active = pathname === item.href || (item.href !== "/partner" && item.href !== "/admin" && pathname.startsWith(item.href));
                const isChat = item.label === "Chat";
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "relative inline-flex items-center text-sm font-semibold transition-colors duration-200 cursor-pointer py-1",
                      active
                        ? "text-foreground font-extrabold"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {item.label}
                    {isChat && totalUnread > 0 && (
                      <span className="absolute -right-2 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[9px] font-bold text-white shadow-sm">
                        {totalUnread > 99 ? "99+" : totalUnread}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>

            <div className="h-4 w-px bg-border/40" />

            {/* Profile Dropdown Trigger */}
            <div className="relative flex items-center" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2.5 cursor-pointer outline-none hover:opacity-95 transition-opacity"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-xs font-extrabold text-foreground border border-border">
                  {user.name.substring(0, 2).toUpperCase()}
                </div>
                <div className="hidden md:flex flex-col text-left">
                  <span className="text-xs font-bold text-foreground leading-none">{user.name}</span>
                  <span className="text-[10px] text-muted-foreground mt-1">
                    {adminScope ? (user.role === "super_admin" ? "Super Admin" : "Admin") : user.role === "client" ? "Klien" : user.partnerCode}
                  </span>
                </div>
              </button>

              {/* Minimalist Profile Dropdown Box */}
              {profileOpen && (
                <div className="absolute right-0 top-11 z-50 w-56 rounded-lg border border-border bg-card p-1.5 shadow-lg animate-in fade-in slide-in-from-top-1 duration-200">
                  <div className="px-3 py-2">
                    <div className="text-xs font-bold text-foreground leading-none">{user.name}</div>
                    <div className="text-[10px] text-muted-foreground mt-1 truncate">{user.email}</div>
                    <div className="mt-1.5 text-[9px] font-semibold text-primary uppercase tracking-wider">
                      {adminScope ? (user.role === "super_admin" ? "Console Super Admin" : "Console Admin") : user.role === "client" ? "Portal Klien" : `Mitra Code: ${user.partnerCode}`}
                    </div>
                  </div>
                  <div className="my-1 border-t border-border/60" />
                  {adminScope && (
                    <>
                      <button
                        type="button"
                        onClick={handleLeadNotificationToggle}
                        disabled={leadEmailPreference.isPending}
                        className="flex w-full items-start gap-3 rounded-md px-3 py-2 text-left transition-colors hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-70"
                      >
                        <div className="mt-0.5 rounded-md border border-border/70 bg-secondary/60 p-1.5 text-foreground">
                          <Bell className="h-3.5 w-3.5" aria-hidden="true" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-bold text-foreground">Notif email lead baru</span>
                            <span
                              className={cn(
                                "inline-flex h-5 w-9 items-center rounded-full border transition-colors",
                                user.leadEmailNotificationsEnabled
                                  ? "border-primary/40 bg-primary/20 justify-end"
                                  : "border-border bg-secondary/80 justify-start",
                              )}
                              aria-hidden="true"
                            >
                              <span className="mx-0.5 h-3.5 w-3.5 rounded-full bg-foreground/90" />
                            </span>
                          </div>
                          <p className="mt-1 text-[10px] leading-relaxed text-muted-foreground">
                            Jika dimatikan, server akan skip email lead baru ke alamat ini sebelum request ke Resend.
                          </p>
                          {leadEmailPreference.isPending ? (
                            <p className="mt-1 text-[10px] font-semibold text-primary">Menyimpan...</p>
                          ) : null}
                          {leadEmailPreference.error instanceof Error ? (
                            <p className="mt-1 text-[10px] font-semibold text-destructive">
                              {leadEmailPreference.error.message}
                            </p>
                          ) : null}
                        </div>
                      </button>
                      <div className="my-1 border-t border-border/60" />
                    </>
                  )}
                  <Link
                    href={user.role === "client" ? "/client/settings" : "/change-password"}
                    className="w-full text-left flex items-center gap-2 px-3 py-2 text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-secondary rounded-md cursor-pointer transition-colors"
                  >
                    <KeyRound className="h-3.5 w-3.5" aria-hidden="true" />
                    {user.role === "client" ? "Pengaturan Akun" : "Ubah password"}
                  </Link>
                  <button
                    type="button"
                    onClick={logout}
                    className="w-full text-left flex items-center gap-2 px-3 py-2 text-xs font-bold text-muted-foreground hover:text-destructive hover:bg-destructive/5 rounded-md cursor-pointer transition-colors"
                  >
                    <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
                    Keluar
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 lg:hidden">
            {mobileDownloadUrl ? (
              <a
                href={mobileDownloadHref}
                aria-label="Download aplikasi mobile"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-foreground transition-colors hover:bg-secondary"
              >
                <Download className="h-4 w-4" aria-hidden="true" />
              </a>
            ) : null}
            <button
              type="button"
              onClick={() => setMobileMenuOpen((open) => !open)}
              aria-expanded={mobileMenuOpen}
              aria-label={mobileMenuOpen ? "Tutup menu" : "Buka menu"}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-foreground transition-colors hover:bg-secondary"
            >
              {mobileMenuOpen ? <X className="h-4 w-4" aria-hidden="true" /> : <Menu className="h-4 w-4" aria-hidden="true" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen ? (
          <div className="border-t border-border/40 bg-background lg:hidden">
            <div className="mx-auto flex max-w-[1400px] flex-col gap-4 px-4 py-4 sm:px-6">
              <div className="rounded-2xl border border-border/70 bg-card p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-xs font-extrabold text-foreground">
                    {user.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-foreground">{user.name}</p>
                    <p className="truncate text-[11px] text-muted-foreground">{user.email}</p>
                  </div>
                </div>
                <p className="mt-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">
                  {adminScope ? (user.role === "super_admin" ? "Super Admin" : "Admin") : user.role === "client" ? "Portal Klien" : `Mitra ${user.partnerCode}`}
                </p>
              </div>

              <nav className="grid grid-cols-2 gap-2">
                {items.map((item) => {
                  const active = pathname === item.href || (item.href !== "/partner" && item.href !== "/admin" && pathname.startsWith(item.href));
                  const isChat = item.label === "Chat";
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "relative rounded-2xl border px-4 py-3 text-sm font-semibold transition-colors",
                        active
                          ? "border-foreground bg-foreground text-background"
                          : "border-border bg-card text-foreground hover:bg-secondary",
                      )}
                    >
                      {item.label}
                      {isChat && totalUnread > 0 ? (
                        <span className={cn(
                          "absolute right-3 top-2 inline-flex min-w-5 items-center justify-center rounded-full px-1.5 py-0.5 text-[9px] font-bold",
                          active ? "bg-background text-foreground" : "bg-destructive text-white",
                        )}>
                          {totalUnread > 99 ? "99+" : totalUnread}
                        </span>
                      ) : null}
                    </Link>
                  );
                })}
              </nav>

              {mobileDownloadUrl ? (
                <a
                  href={mobileDownloadHref}
                  className="inline-flex items-center justify-between rounded-2xl border border-border bg-secondary px-4 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-card"
                >
                  <span className="inline-flex items-center gap-2">
                    <Smartphone className="h-4 w-4" aria-hidden="true" />
                    Download aplikasi
                  </span>
                  <Download className="h-4 w-4" aria-hidden="true" />
                </a>
              ) : null}

              <div className="grid gap-2">
                <Link
                  href={user.role === "client" ? "/client/settings" : "/change-password"}
                  className="inline-flex items-center gap-2 rounded-2xl border border-border bg-card px-4 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-secondary"
                >
                  <KeyRound className="h-4 w-4" aria-hidden="true" />
                  {user.role === "client" ? "Pengaturan akun" : "Ubah password"}
                </Link>
                <button
                  type="button"
                  onClick={logout}
                  className="inline-flex items-center gap-2 rounded-2xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm font-semibold text-destructive transition-colors hover:bg-destructive/10"
                >
                  <LogOut className="h-4 w-4" aria-hidden="true" />
                  Keluar
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </header>
      <div className={cn("mx-auto flex w-full max-w-[1400px] flex-1 flex-col overflow-hidden px-4 py-5 sm:px-6 sm:py-8", noPadding && "max-w-none px-0 py-0")}>
        {children}
      </div>
    </main>
  );
}
