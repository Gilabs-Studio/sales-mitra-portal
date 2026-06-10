"use client";

import * as React from "react";
import { ArrowLeft, ArrowRight, Ban, CheckCircle2, ShieldAlert, Users } from "lucide-react";
import { AppShell } from "@/features/dashboard/components/app-shell";
import { useAuthGuard } from "@/features/auth/hooks/use-auth";
import { useAdminPartners, useUpdateUserSuspension } from "../hooks/use-admin";
import { formatDate } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

export function PartnerManagementScreen() {
  const auth = useAuthGuard("admin");
  const [page, setPage] = React.useState(1);
  const pageSize = 10;

  const { data: partnersData, isLoading, isError, refetch } = useAdminPartners({
    page,
    pageSize,
  });

  if (auth.isLoading || !auth.isAllowed || !auth.user) {
    return <div className="min-h-screen bg-background" />;
  }

  const handlePrevPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  const handleNextPage = () => {
    if (partnersData && page < partnersData.totalPages) {
      setPage(page + 1);
    }
  };

  return (
    <AppShell user={auth.user}>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase text-muted-foreground">Console Admin</p>
            <h1 className="mt-2 text-4xl font-extrabold text-foreground">Daftar Mitra Portal</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
              Lihat performa pipeline lead, statistik won/rejected, dan kelola status akun dari setiap mitra sales.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-border bg-secondary px-4 py-2 text-sm font-semibold text-muted-foreground self-start md:self-center">
            <Users className="h-4 w-4 text-primary" aria-hidden="true" />
            <span>Total: {partnersData?.total ?? 0} mitra</span>
          </div>
        </div>

        {isError ? (
          <div className="rounded-lg border border-destructive bg-destructive/5 p-4 text-sm font-semibold text-destructive">
            Gagal memuat daftar mitra portal. Silakan coba lagi.
            <button
              onClick={() => void refetch()}
              className="ml-3 underline cursor-pointer text-xs uppercase hover:text-destructive/80 transition-colors"
            >
              Coba Lagi
            </button>
          </div>
        ) : null}

        <div className="rounded-lg border border-border bg-card overflow-hidden">
          <ScrollArea orientation="horizontal">
            {isLoading ? (
              <div className="p-8 text-center text-sm text-muted-foreground animate-pulse">
                Sedang memuat data mitra...
              </div>
            ) : (partnersData?.data?.length ?? 0) === 0 ? (
              <div className="p-8 text-center text-sm text-muted-foreground">
                Belum ada mitra yang terdaftar dalam portal.
              </div>
            ) : (
              <table className="w-full min-w-[1000px] border-collapse text-left text-sm">
                <thead className="bg-secondary text-xs uppercase text-muted-foreground font-semibold">
                  <tr>
                    <th className="border-b border-border px-5 py-4 w-[280px]">Nama / Profil</th>
                    <th className="border-b border-border px-5 py-4">Kode Mitra</th>
                    <th className="border-b border-border px-5 py-4 text-center">Total Lead</th>
                    <th className="border-b border-border px-5 py-4 text-center text-emerald-600">Won</th>
                    <th className="border-b border-border px-5 py-4 text-center text-amber-600">Qualified</th>
                    <th className="border-b border-border px-5 py-4 text-center text-rose-600">Rejected</th>
                    <th className="border-b border-border px-5 py-4">Status Akun</th>
                    <th className="border-b border-border px-5 py-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {partnersData?.data.map((partner) => (
                    <PartnerRow key={partner.id} partner={partner} />
                  ))}
                </tbody>
              </table>
            )}
          </ScrollArea>
        </div>

        {/* Pagination Controls */}
        {partnersData && partnersData.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-border/50 pt-4">
            <div className="text-xs text-muted-foreground font-medium">
              Menampilkan Halaman <span className="font-bold text-foreground">{page}</span> dari{" "}
              <span className="font-bold text-foreground">{partnersData.totalPages}</span> (Total {partnersData.total} mitra)
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                disabled={page <= 1}
                onClick={handlePrevPage}
                className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-border bg-card px-3 text-xs font-bold text-foreground transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 hover:bg-secondary disabled:pointer-events-none disabled:opacity-50 cursor-pointer"
              >
                <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
                Sebelumnya
              </button>
              <button
                type="button"
                disabled={page >= partnersData.totalPages}
                onClick={handleNextPage}
                className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-border bg-card px-3 text-xs font-bold text-foreground transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 hover:bg-secondary disabled:pointer-events-none disabled:opacity-50 cursor-pointer"
              >
                Berikutnya
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}

function PartnerRow({ partner }: { partner: any }) {
  const suspension = useUpdateUserSuspension(partner.id);

  const handleToggleSuspension = async () => {
    if (partner.isSuspended) {
      const confirmActivate = window.confirm(`Apakah Anda yakin ingin mengaktifkan kembali akun mitra ${partner.name}?`);
      if (confirmActivate) {
        await suspension.mutateAsync({ isSuspended: false, reason: "" });
      }
      return;
    }

    const reason = window.prompt(`Alasan menangguhkan (suspend) akun ${partner.name}:`, "Akses kemitraan dinonaktifkan sementara");
    if (reason === null) {
      return;
    }
    await suspension.mutateAsync({ isSuspended: true, reason });
  };

  return (
    <tr className={`align-middle transition-colors hover:bg-secondary/30 ${partner.isSuspended ? "bg-destructive/5" : ""}`}>
      <td className="px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-secondary text-xs font-extrabold text-foreground">
            {partner.name.substring(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="font-extrabold text-foreground truncate">{partner.name}</p>
            <p className="text-xs text-muted-foreground truncate">{partner.email}</p>
            <p className="mt-0.5 text-[10px] text-muted-foreground">Terdaftar {formatDate(partner.createdAt)}</p>
          </div>
        </div>
      </td>
      <td className="px-5 py-4 font-mono text-xs font-bold text-foreground">
        {partner.partnerCode || "-"}
      </td>
      <td className="px-5 py-4 text-center font-bold text-foreground">
        {partner.totalLeads}
      </td>
      <td className="px-5 py-4 text-center font-extrabold text-emerald-600">
        {partner.wonLeads}
      </td>
      <td className="px-5 py-4 text-center font-bold text-amber-600">
        {partner.qualifiedLeads}
      </td>
      <td className="px-5 py-4 text-center font-bold text-rose-600">
        {partner.rejectedLeads}
      </td>
      <td className="px-5 py-4">
        {partner.isSuspended ? (
          <div className="inline-flex items-center gap-1.5 rounded-lg border border-destructive bg-destructive/10 px-2.5 py-1 text-[11px] font-bold text-destructive">
            <ShieldAlert className="h-3.5 w-3.5" aria-hidden="true" />
            Suspended
          </div>
        ) : (
          <div className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-600 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-bold text-emerald-600">
            <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
            Aktif
          </div>
        )}
        {partner.isSuspended && partner.suspendedReason && (
          <p className="mt-1 text-[10px] text-destructive leading-normal max-w-[200px] break-words">
            Alasan: {partner.suspendedReason}
          </p>
        )}
      </td>
      <td className="px-5 py-4 text-right">
        <button
          type="button"
          disabled={suspension.isPending}
          onClick={handleToggleSuspension}
          className={`inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs font-bold transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer hover:bg-secondary disabled:pointer-events-none disabled:opacity-50 ${
            partner.isSuspended
              ? "text-emerald-600 hover:text-emerald-700"
              : "text-destructive hover:text-destructive/80"
          }`}
        >
          {partner.isSuspended ? (
            "Aktifkan"
          ) : (
            <>
              <Ban className="h-3 w-3" aria-hidden="true" />
              Suspend
            </>
          )}
        </button>
      </td>
    </tr>
  );
}
