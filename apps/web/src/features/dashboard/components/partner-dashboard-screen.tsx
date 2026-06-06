"use client";

import { AppShell } from "./app-shell";
import { BreakdownGrid, MetricGrid } from "./metric-grid";
import { ReferralList } from "./referral-list";
import { useAuthGuard } from "@/features/auth/hooks/use-auth";
import { LeadTable } from "@/features/leads/components/lead-table";
import { usePartnerDashboard } from "../hooks/use-dashboard";

export function PartnerDashboardScreen() {
  const auth = useAuthGuard("partner");
  const dashboard = usePartnerDashboard();

  if (auth.isLoading || !auth.isAllowed || !auth.user) {
    return <div className="min-h-screen bg-background" />;
  }

  return (
    <AppShell user={auth.user}>
      <div className="space-y-6">
        <section>
          <p className="text-sm font-semibold uppercase text-muted-foreground">Mitra workspace</p>
          <h1 className="mt-2 text-3xl font-extrabold text-foreground">Pipeline prospek Anda</h1>
          <p className="mt-2 max-w-2xl font-serif text-lg leading-7 text-muted-foreground">
            Submit lead, pantau status, dan gunakan referral code tanpa onboarding panjang.
          </p>
        </section>
        {dashboard.isError ? <p className="text-sm font-semibold text-destructive">Dashboard gagal dimuat.</p> : null}
        <MetricGrid metrics={dashboard.data?.summary ?? []} />
        <div className="grid gap-4 lg:grid-cols-2">
          <BreakdownGrid title="Status lead" items={dashboard.data?.statusBreakdown ?? []} />
          <BreakdownGrid title="Layanan" items={dashboard.data?.serviceBreakdown ?? []} />
        </div>
        <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
          <section>
            <h2 className="mb-3 text-lg font-extrabold text-foreground">Lead terbaru</h2>
            <LeadTable leads={dashboard.data?.recentLeads ?? []} />
          </section>
          <ReferralList referrals={dashboard.data?.referrals ?? []} />
        </div>
      </div>
    </AppShell>
  );
}
