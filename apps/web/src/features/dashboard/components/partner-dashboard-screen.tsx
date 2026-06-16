"use client";

import { Plus } from "lucide-react";
import { AppShell } from "./app-shell";
import { BreakdownGrid, MetricGrid } from "./metric-grid";
import { ReferralList } from "./referral-list";
import { useAuthGuard } from "@/features/auth/hooks/use-auth";
import { LeadTable } from "@/features/leads/components/lead-table";
import { usePartnerDashboard } from "../hooks/use-dashboard";
import { Dialog, DialogContent, DialogOverlay } from "@/components/ui/dialog";
import { LeadForm } from "@/features/leads/components/lead-form";
import { useLeadModalStore } from "@/features/leads/stores/use-lead-modal-store";

export function PartnerDashboardScreen() {
  const auth = useAuthGuard("partner");
  const dashboard = usePartnerDashboard();
  const modal = useLeadModalStore();

  if (auth.isLoading || !auth.isAllowed || !auth.user) {
    return <div className="min-h-screen bg-background" />;
  }

  return (
    <AppShell user={auth.user}>
      <div className="space-y-6">
        <section className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase text-muted-foreground">Mitra workspace</p>
            <h1 className="mt-2 text-3xl font-sans font-medium tracking-tight text-foreground">Pipeline komisi project IT Anda</h1>
            <p className="mt-2 max-w-2xl font-serif text-lg leading-7 text-muted-foreground">
              Submit lead, pantau status, dan gunakan referral code untuk membuka peluang passive income dari jaringan Anda
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={modal.open}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/30 active:translate-y-0 cursor-pointer shadow"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              Submit lead
            </button>
          </div>
        </section>
        {dashboard.isError ? <p className="text-sm font-semibold text-destructive">Dashboard gagal dimuat</p> : null}
        <MetricGrid metrics={dashboard.data?.summary ?? []} />
        <div className="grid gap-4 lg:grid-cols-2">
          <BreakdownGrid title="Status lead" items={dashboard.data?.statusBreakdown ?? []} />
          <BreakdownGrid title="Layanan" items={dashboard.data?.serviceBreakdown ?? []} />
        </div>
        <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
          <section className="space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground font-sans">Lead terbaru</h2>
            <LeadTable leads={dashboard.data?.recentLeads ?? []} />
          </section>
          <ReferralList referrals={dashboard.data?.referrals ?? []} />
        </div>
      </div>

      <Dialog open={modal.isOpen} onOpenChange={(open) => (open ? modal.open() : modal.close())}>
        <DialogOverlay />
        <DialogContent className="max-w-2xl p-0 overflow-hidden">
          <LeadForm onSuccess={modal.close} onCancel={modal.close} />
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
