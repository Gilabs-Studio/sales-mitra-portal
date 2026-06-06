"use client";

import { AppShell } from "@/features/dashboard/components/app-shell";
import { useAuthGuard } from "@/features/auth/hooks/use-auth";
import { Pagination } from "@/components/ui/pagination";
import { LeadFilters } from "@/features/leads/components/lead-filters";
import { LeadTable } from "@/features/leads/components/lead-table";
import { useAdminLeads, useLeadFilters } from "@/features/leads/hooks/use-leads";
import { AdminLeadStatusForm } from "./admin-lead-status-form";

export function AdminLeadsScreen() {
  const auth = useAuthGuard("admin");
  const leads = useAdminLeads();
  const { page, setPage } = useLeadFilters();

  if (auth.isLoading || !auth.isAllowed || !auth.user) {
    return <div className="min-h-screen bg-background" />;
  }

  const paginationMeta = leads.data;

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
        {leads.isError ? (
          <p className="text-sm font-semibold text-destructive">Lead gagal dimuat</p>
        ) : null}
        <LeadTable
          leads={leads.data?.data ?? []}
          showPartner
          role="admin"
          actions={(lead) => <AdminLeadStatusForm lead={lead} />}
        />
        {paginationMeta && paginationMeta.totalPages > 1 ? (
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Menampilkan {((page - 1) * paginationMeta.pageSize) + 1}–
              {Math.min(page * paginationMeta.pageSize, paginationMeta.total)} dari{" "}
              {paginationMeta.total} lead
            </p>
            <Pagination
              page={paginationMeta.page}
              totalPages={paginationMeta.totalPages}
              onPageChange={setPage}
            />
          </div>
        ) : null}
      </section>
    </AppShell>
  );
}
