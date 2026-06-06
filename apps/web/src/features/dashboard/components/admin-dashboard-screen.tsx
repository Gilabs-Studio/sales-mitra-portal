"use client";

import { AppShell } from "./app-shell";
import { BreakdownGrid, MetricGrid } from "./metric-grid";
import { useAuthGuard } from "@/features/auth/hooks/use-auth";
import { PartnerStatsPanel } from "@/features/admin/components/partner-stats-panel";
import { LeadTable } from "@/features/leads/components/lead-table";
import { useAdminDashboard } from "../hooks/use-dashboard";

export function AdminDashboardScreen() {
  const auth = useAuthGuard("admin");
  const dashboard = useAdminDashboard();

  if (auth.isLoading || !auth.isAllowed || !auth.user) {
    return <div className="min-h-screen bg-background" />;
  }

  return (
    <AppShell user={auth.user}>
      <div className="space-y-6">
        <section>
          <p className="text-sm font-semibold uppercase text-muted-foreground">Admin command center</p>
          <h1 className="mt-2 text-3xl font-extrabold text-foreground">Lead yang sudah terkualifikasi</h1>
          <p className="mt-2 max-w-2xl font-serif text-lg leading-7 text-muted-foreground">
            Fokus pada prospek yang lolos filter, pantau mitra, dan update status tanpa meeting awal yang boros waktu.
          </p>
        </section>
        {dashboard.isError ? <p className="text-sm font-semibold text-destructive">Dashboard gagal dimuat.</p> : null}
        <MetricGrid metrics={dashboard.data?.summary ?? []} />
        <div className="grid gap-4 lg:grid-cols-2">
          <BreakdownGrid title="Status lead" items={dashboard.data?.statusBreakdown ?? []} />
          <BreakdownGrid title="Layanan" items={dashboard.data?.serviceBreakdown ?? []} />
        </div>
        <div className="grid gap-4 lg:grid-cols-[1fr_380px]">
          <section>
            <h2 className="mb-3 text-lg font-extrabold text-foreground">Lead terbaru</h2>
            <LeadTable leads={dashboard.data?.recentLeads ?? []} showPartner />
          </section>
          <PartnerStatsPanel />
        </div>
      </div>
    </AppShell>
  );
}
