"use client";

import { Shield, ShieldCheck } from "lucide-react";
import { useAdminUsers } from "../hooks/use-admin";
import { formatDate } from "@/lib/utils";

export function AdminUserList() {
  const admins = useAdminUsers();

  return (
    <section className="rounded-lg border border-border bg-card p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase text-muted-foreground">Akses internal</p>
          <h2 className="mt-1 text-2xl font-extrabold text-foreground">Admin terdaftar</h2>
        </div>
        <div className="rounded-full border border-border bg-secondary px-3 py-1 text-xs font-semibold text-muted-foreground">
          {admins.data?.length ?? 0} akun
        </div>
      </div>

      {admins.isError ? (
        <p className="mt-4 text-sm font-semibold text-destructive">Daftar admin gagal dimuat.</p>
      ) : null}

      <div className="mt-5 space-y-3">
        {admins.isLoading ? (
          <div className="rounded-lg border border-border bg-secondary p-4 text-sm text-muted-foreground">
            Memuat daftar admin...
          </div>
        ) : null}

        {admins.data?.map((admin) => {
          const isSuperAdmin = admin.role === "super_admin";
          return (
            <div key={admin.id} className="rounded-lg border border-border bg-secondary p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    {isSuperAdmin ? (
                      <ShieldCheck className="h-4 w-4 text-primary" aria-hidden="true" />
                    ) : (
                      <Shield className="h-4 w-4 text-foreground" aria-hidden="true" />
                    )}
                    <p className="font-extrabold text-foreground">{admin.name}</p>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{admin.email}</p>
                  <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    @{admin.username}
                  </p>
                </div>
                <div className="text-right">
                  <div className="inline-flex rounded-full border border-border bg-background px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-foreground">
                    {isSuperAdmin ? "Super Admin" : "Admin"}
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">Dibuat {formatDate(admin.createdAt)}</p>
                </div>
              </div>
            </div>
          );
        })}

        {!admins.isLoading && (admins.data?.length ?? 0) === 0 ? (
          <div className="rounded-lg border border-dashed border-border bg-secondary p-4 text-sm text-muted-foreground">
            Belum ada admin tambahan yang terdaftar.
          </div>
        ) : null}
      </div>
    </section>
  );
}
