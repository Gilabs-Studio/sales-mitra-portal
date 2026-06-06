"use client";

import { AppShell } from "@/features/dashboard/components/app-shell";
import { useAuthGuard } from "@/features/auth/hooks/use-auth";
import { Pagination } from "@/components/ui/pagination";
import { LeadFilters } from "./lead-filters";
import { LeadForm } from "./lead-form";
import { LeadTable } from "./lead-table";
import { usePartnerLeads, useLeadFilters } from "../hooks/use-leads";

export function PartnerLeadsScreen() {
  const auth = useAuthGuard("partner");
  const leads = usePartnerLeads();
  const { page, setPage } = useLeadFilters();

  if (auth.isLoading || !auth.isAllowed || !auth.user) {
    return <div className="min-h-screen bg-background" />;
  }

  const paginationMeta = leads.data;

  return (
    <AppShell user={auth.user}>
      <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
        <LeadForm />
        <section className="space-y-4">
          <div>
            <h1 className="text-3xl font-extrabold text-foreground">Lead Anda</h1>
            <p className="mt-2 font-serif text-lg leading-7 text-muted-foreground">
              Semua prospek tersimpan dengan hasil kualifikasi otomatis dan tracking yang transparan
            </p>
          </div>
          <LeadFilters />
          {leads.isError ? (
            <p className="text-sm font-semibold text-destructive">Lead gagal dimuat</p>
          ) : null}
          <LeadTable leads={leads.data?.data ?? []} role="partner" />
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
      </div>
    </AppShell>
  );
}
