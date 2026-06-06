"use client";

import { AppShell } from "@/features/dashboard/components/app-shell";
import { useAuthGuard } from "@/features/auth/hooks/use-auth";
import { LeadFilters } from "@/features/leads/components/lead-filters";
import { LeadTable } from "@/features/leads/components/lead-table";
import { useAdminLeads } from "@/features/leads/hooks/use-leads";
import { AdminLeadStatusForm } from "./admin-lead-status-form";

export function AdminLeadsScreen() {
  const auth = useAuthGuard("admin");
  const leads = useAdminLeads();

  if (auth.isLoading || !auth.isAllowed || !auth.user) {
    return <div className="min-h-screen bg-background" />;
  }

  return (
    <AppShell user={auth.user}>
      <section className="space-y-4">
        <div>
          <h1 className="text-3xl font-extrabold text-foreground">Review lead mitra</h1>
          <p className="mt-2 max-w-2xl font-serif text-lg leading-7 text-muted-foreground">
            Update status pipeline dari satu layar dengan endpoint JOIN agar data mitra tidak diambil satu per satu
          </p>
        </div>
        <LeadFilters />
        {leads.isError ? <p className="text-sm font-semibold text-destructive">Lead gagal dimuat</p> : null}
        <LeadTable
          leads={leads.data ?? []}
          showPartner
          actions={(lead) => <AdminLeadStatusForm lead={lead} />}
        />
      </section>
    </AppShell>
  );
}
