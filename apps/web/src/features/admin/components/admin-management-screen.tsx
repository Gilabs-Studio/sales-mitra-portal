"use client";

import { ArrowLeftRight, ShieldAlert } from "lucide-react";
import { AppShell } from "@/features/dashboard/components/app-shell";
import { useAuthGuard } from "@/features/auth/hooks/use-auth";
import { AddAdminPanel } from "./add-admin-panel";
import { AdminUserList } from "./admin-user-list";

export function AdminManagementScreen() {
  const auth = useAuthGuard("admin");

  if (auth.isLoading || !auth.isAllowed || !auth.user) {
    return <div className="min-h-screen bg-background" />;
  }

  const isSuperAdmin = auth.user.role === "super_admin";

  return (
    <AppShell user={auth.user}>
      <div className="space-y-6">
        <div>
          <p className="text-sm font-semibold uppercase text-muted-foreground">Super admin workspace</p>
          <h1 className="mt-2 text-4xl font-sans font-medium tracking-tight text-foreground">Kelola admin portal</h1>
          <p className="mt-3 max-w-2xl font-serif text-lg leading-7 text-muted-foreground">
            Tambahkan akun admin baru dan pantau siapa saja yang saat ini punya akses ke area admin.
          </p>
        </div>

        {!isSuperAdmin ? (
          <section className="rounded-lg border border-border bg-card p-6">
            <div className="flex items-start gap-3">
              <ShieldAlert className="mt-0.5 h-5 w-5 text-destructive" aria-hidden="true" />
              <div>
                <h2 className="text-lg font-sans font-semibold tracking-tight text-foreground">Akses dibatasi</h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                  Halaman ini hanya bisa digunakan oleh super admin. Admin biasa tetap dapat memakai seluruh fitur admin lain seperti lead, chat, dan layanan.
                </p>
              </div>
            </div>
          </section>
        ) : (
          <div className="grid gap-4 xl:grid-cols-[420px_1fr]">
            <div className="space-y-4">
              <AddAdminPanel />
              <section className="rounded-lg border border-border bg-card p-5">
                <div className="flex items-center gap-2 text-sm font-extrabold text-foreground">
                  <ArrowLeftRight className="h-4 w-4 text-primary" aria-hidden="true" />
                  Aturan akses
                </div>
                <div className="mt-4 space-y-3 text-sm leading-6 text-muted-foreground">
                  <p>Super admin punya semua fitur admin biasa.</p>
                  <p>Hak tambahan super admin hanya untuk membuat akun admin baru.</p>
                  <p>Admin biasa tidak mendapat menu ini dan API juga tetap memblokir akses langsung.</p>
                </div>
              </section>
            </div>
            <AdminUserList />
          </div>
        )}
      </div>
    </AppShell>
  );
}
