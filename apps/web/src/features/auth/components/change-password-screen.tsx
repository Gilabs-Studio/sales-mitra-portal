"use client";

import { AppShell } from "@/features/dashboard/components/app-shell";
import { useAuthGuard } from "../hooks/use-auth";
import { ChangePasswordForm } from "./change-password-form";

export function ChangePasswordScreen() {
  const auth = useAuthGuard();

  if (auth.isLoading || !auth.user) {
    return <div className="min-h-screen bg-background" />;
  }

  return (
    <AppShell user={auth.user}>
      <section className="mx-auto w-full max-w-xl space-y-5 rounded-lg border border-border bg-card p-6">
        <div>
          <p className="text-sm font-semibold uppercase text-muted-foreground">Keamanan akun</p>
          <h1 className="mt-2 text-3xl font-extrabold text-foreground">Ubah password</h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Karena Anda sudah login, cukup masukkan password lama dan password baru. Link email reset hanya dipakai saat lupa password di halaman login.
          </p>
        </div>
        <ChangePasswordForm />
      </section>
    </AppShell>
  );
}
