"use client";

import { AppShell } from "@/features/dashboard/components/app-shell";
import { useAuthGuard } from "@/features/auth/hooks/use-auth";
import { Pagination } from "@/components/ui/pagination";
import { Dialog, DialogContent, DialogOverlay } from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { LeadFilters } from "./lead-filters";
import { LeadForm } from "./lead-form";
import { LeadTable } from "./lead-table";
import { usePartnerLeads, useLeadFilters } from "../hooks/use-leads";
import { useLeadModalStore } from "../stores/use-lead-modal-store";

export function PartnerLeadsScreen() {
  const auth = useAuthGuard("partner");
  const leads = usePartnerLeads();
  const { page, setPage } = useLeadFilters();
  const modal = useLeadModalStore();

  if (auth.isLoading || !auth.isAllowed || !auth.user) {
    return <div className="min-h-screen bg-background" />;
  }

  const paginationMeta = leads.data;

  return (
    <AppShell user={auth.user}>
      <div className="space-y-6">
        <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-sans font-medium tracking-tight text-foreground">Lead Anda</h1>
            <p className="mt-2 font-serif text-lg leading-7 text-muted-foreground">
              Semua prospek tersimpan dengan hasil kualifikasi otomatis dan tracking yang transparan
            </p>
          </div>
          <button
            onClick={modal.open}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/30 active:translate-y-0 transition-all duration-300 cursor-pointer shrink-0"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Submit lead baru
          </button>
        </section>

        <section className="space-y-4">
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

      <Dialog open={modal.isOpen} onOpenChange={(open) => (open ? modal.open() : modal.close())}>
        <DialogOverlay />
        <DialogContent className="max-w-2xl p-0 overflow-hidden">
          <LeadForm onSuccess={modal.close} onCancel={modal.close} />
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
