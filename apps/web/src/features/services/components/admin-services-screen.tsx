"use client";

import { AppShell } from "@/features/dashboard/components/app-shell";
import { useAuthGuard } from "@/features/auth/hooks/use-auth";
import { ServiceAdminPanel } from "./service-admin-panel";

export function AdminServicesScreen() {
  const auth = useAuthGuard("admin");

  if (auth.isLoading || !auth.isAllowed || !auth.user) {
    return null;
  }

  return (
    <AppShell user={auth.user}>
      <div className="space-y-6">
        <div>
          <p className="text-sm font-semibold uppercase text-muted-foreground">Admin workspace</p>
          <h1 className="mt-2 text-4xl font-extrabold text-foreground">Service catalog</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
            Kelola layanan, budget minimum, dan rule discovery supaya lead mitra masuk dengan kualifikasi yang jelas
          </p>
        </div>
        <ServiceAdminPanel />
      </div>
    </AppShell>
  );
}
