"use client";

import { ArrowRight, FolderTree, GitBranch, Layers3, Network, Settings2, Users } from "lucide-react";
import { Link } from "@/i18n/routing";
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
        <section className="grid gap-5 lg:grid-cols-[360px_1fr]">
          <aside className="rounded-lg border border-border bg-card p-5">
            <div className="flex items-center gap-2 text-sm font-extrabold text-foreground">
              <FolderTree className="h-4 w-4" aria-hidden="true" />
              Admin tree
            </div>
            <div className="mt-5 space-y-3 border-l border-border pl-4">
              {[
                { Icon: Network, label: "Ekosistem mitra", value: "Registrasi dan referral partner" },
                { Icon: GitBranch, label: "Pipeline lead", value: "Submitted sampai won" },
                { Icon: Layers3, label: "Katalog layanan", value: "Budget gate dan discovery" },
                { Icon: Users, label: "Tim internal", value: "Fokus closing dan delivery" },
              ].map(({ Icon, label, value }) => (
                <div key={label} className="relative rounded-lg border border-border bg-secondary p-3">
                  <span className="absolute -left-4 top-5 h-px w-3 bg-border" aria-hidden="true" />
                  <div className="flex items-start gap-3">
                    <Icon className="mt-0.5 h-4 w-4 text-primary" aria-hidden="true" />
                    <div>
                      <p className="text-sm font-extrabold text-foreground">{label}</p>
                      <p className="mt-1 text-xs leading-5 text-muted-foreground">{value}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </aside>
          <div className="flex flex-col justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase text-muted-foreground">Admin command center</p>
              <h1 className="mt-2 text-4xl font-extrabold text-foreground">Lead terkualifikasi dari jaringan mitra</h1>
              <p className="mt-3 max-w-2xl font-serif text-lg leading-7 text-muted-foreground">
                Fokus pada prospek bernilai, pantau performa mitra, dan kelola layanan agar akuisisi project IT berjalan transparan
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                href="/admin/leads"
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-primary bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0"
              >
                Kelola lead
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link
                href="/admin/services"
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-border bg-secondary px-4 py-2 text-sm font-semibold text-foreground transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0"
              >
                <Settings2 className="h-4 w-4" aria-hidden="true" />
                CRUD layanan
              </Link>
            </div>
          </div>
        </section>
        {dashboard.isError ? <p className="text-sm font-semibold text-destructive">Dashboard gagal dimuat</p> : null}
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
