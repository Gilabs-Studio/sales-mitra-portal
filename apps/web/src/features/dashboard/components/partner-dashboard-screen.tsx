"use client";

import { Plus, Send } from "lucide-react";
import { Link } from "@/i18n/routing";
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
        <section className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase text-muted-foreground">Mitra workspace</p>
            <h1 className="mt-2 text-3xl font-extrabold text-foreground">Pipeline komisi project IT Anda</h1>
            <p className="mt-2 max-w-2xl font-serif text-lg leading-7 text-muted-foreground">
              Submit lead, pantau status, dan gunakan referral code untuk membuka peluang passive income dari jaringan Anda
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/partner/leads"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-primary bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              Submit lead
            </Link>
            <Link
              href="/partner/leads"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-border bg-secondary px-4 py-2 text-sm font-semibold text-foreground transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0"
            >
              <Send className="h-4 w-4" aria-hidden="true" />
              Quick action
            </Link>
          </div>
        </section>
        {dashboard.isError ? <p className="text-sm font-semibold text-destructive">Dashboard gagal dimuat</p> : null}
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
