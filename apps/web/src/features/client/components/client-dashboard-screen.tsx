"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { AppShell } from "@/features/dashboard/components/app-shell";
import { useAuthGuard } from "@/features/auth/hooks/use-auth";
import { useClientDashboard, useCreateMaintenanceRequestGeneric } from "../hooks/use-client";
import { formatCurrency } from "@/lib/utils";

export function ClientDashboardScreen() {
  const auth = useAuthGuard("client");
  const t = useTranslations("client");
  const dashboard = useClientDashboard();
  const reportMutation = useCreateMaintenanceRequestGeneric();

  // Quick Action form state
  const [isReportOpen, setIsReportOpen] = React.useState(false);
  const [selectedProjectId, setSelectedProjectId] = React.useState("");
  const [selectedMaintId, setSelectedMaintId] = React.useState("");
  const [reportDesc, setReportDesc] = React.useState("");

  if (auth.isLoading || !auth.isAllowed || !auth.user) {
    return <div className="min-h-screen bg-background" />;
  }

  const data = dashboard.data;

  // Sync selected project and prefill first maintenance ID
  const handleProjectSelect = (projId: string) => {
    setSelectedProjectId(projId);
    if (data?.maintenance) {
      const filtered = data.maintenance.filter((m) => m.projectId === projId && m.quotaUsed < m.quotaLimit);
      if (filtered.length > 0) {
        setSelectedMaintId(filtered[0].id);
      } else {
        setSelectedMaintId("");
      }
    }
  };

  const openReportModal = () => {
    setReportDesc("");
    if (data?.projects && data.projects.length > 0) {
      const firstProjId = data.projects[0].id;
      setSelectedProjectId(firstProjId);
      if (data.maintenance) {
        const filtered = data.maintenance.filter((m) => m.projectId === firstProjId && m.quotaUsed < m.quotaLimit);
        if (filtered.length > 0) {
          setSelectedMaintId(filtered[0].id);
        } else {
          setSelectedMaintId("");
        }
      }
    }
    setIsReportOpen(true);
  };

  const handleReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProjectId || !selectedMaintId || !reportDesc.trim()) return;

    reportMutation.mutate({
      projectId: selectedProjectId,
      payload: {
        maintenanceId: selectedMaintId,
        description: reportDesc,
      }
    }, {
      onSuccess: () => {
        setIsReportOpen(false);
        setReportDesc("");
        alert("Laporan kendala/bug berhasil dikirim.");
      }
    });
  };

  // Find active maintenance packages for the selected project
  const availableMaintenance = data?.maintenance?.filter((m) => m.projectId === selectedProjectId && m.quotaUsed < m.quotaLimit) ?? [];

  return (
    <AppShell user={auth.user}>
      <div className="max-w-5xl mx-auto space-y-12 py-8 px-4 font-sans text-foreground">
        
        {/* Welcome Section */}
        <section className="space-y-4">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Portal Klien GiLabs
          </p>
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground md:text-5xl">
            Halo, {auth.user.name}
          </h1>
          <p className="max-w-2xl text-base text-muted-foreground leading-relaxed">
            Selamat datang di pusat kendali dan pemantauan project IT Anda.
          </p>
        </section>

        {/* Quick Action Trigger */}
        <section className="border border-border rounded-lg bg-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-foreground">Layanan Cepat</h3>
            <p className="text-xs text-muted-foreground">Laporkan bug, kendala teknis, atau minta request pengerjaan maintenance baru secara instan.</p>
          </div>
          <button
            onClick={openReportModal}
            className="inline-flex min-h-11 items-center justify-center rounded-lg bg-primary px-5 py-2.5 text-xs font-extrabold text-primary-foreground hover:opacity-90 transition-all cursor-pointer whitespace-nowrap"
          >
            Laporkan Kendala / Bug
          </button>
        </section>

        {dashboard.isLoading ? (
          <div className="h-64 animate-pulse rounded-lg bg-muted" />
        ) : dashboard.isError ? (
          <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4 text-sm font-semibold text-destructive">
            Gagal memuat data dashboard.
          </div>
        ) : (
          <div className="grid gap-12 md:grid-cols-2">
            
            {/* Left side: Project Saya */}
            <div className="space-y-6">
              <h2 className="text-xl font-extrabold tracking-tight text-foreground">
                Project Saya
              </h2>
              <div className="space-y-4">
                {data?.projects && data.projects.length > 0 ? (
                  data.projects.map((p) => (
                    <Link
                      key={p.id}
                      href={`/client/projects/${p.id}`}
                      className="block rounded-lg border border-border bg-card p-6 hover:bg-secondary/40 transition-all cursor-pointer space-y-3"
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-primary border border-border px-2 py-0.5 rounded">
                          {p.status}
                        </span>
                      </div>
                      <h3 className="text-lg font-extrabold text-foreground tracking-tight">
                        {p.name}
                      </h3>
                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                        {p.description}
                      </p>
                      <div className="text-[11px] text-muted-foreground pt-2 border-t border-border/40">
                        Dimulai: {p.startDate}
                      </div>
                    </Link>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground leading-6">
                    Anda belum memiliki project terdaftar di portal ini.
                  </p>
                )}
              </div>
            </div>

            {/* Right side: Maintenance & Activity */}
            <div className="space-y-12">
              {/* Maintenance Quota Status */}
              <div className="space-y-6">
                <h2 className="text-xl font-extrabold tracking-tight text-foreground">
                  Maintenance Aktif
                </h2>
                <div className="space-y-4">
                  {data?.maintenance && data.maintenance.length > 0 ? (
                    data.maintenance.map((m) => {
                      const remaining = m.quotaLimit - m.quotaUsed;
                      const project = data.projects.find((p) => p.id === m.projectId);
                      return (
                        <div
                          key={m.id}
                          className="rounded-lg border border-border bg-card p-5 space-y-3"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="text-xs font-bold text-muted-foreground uppercase">{project?.name}</h4>
                              <h3 className="text-sm font-extrabold text-foreground mt-0.5">{m.packageName}</h3>
                            </div>
                            <span className="rounded bg-teal-500/10 px-2 py-0.5 text-[10px] font-bold text-teal-600">
                              Aktif
                            </span>
                          </div>
                          <div className="space-y-1.5">
                            <div className="flex justify-between text-xs text-muted-foreground">
                              <span>Pemakaian kuota</span>
                              <span className="font-bold text-foreground">{m.quotaUsed} / {m.quotaLimit} Request</span>
                            </div>
                            <div className="h-2 w-full rounded bg-muted overflow-hidden">
                              <div
                                className="h-full bg-primary"
                                style={{ width: `${Math.min((m.quotaUsed / m.quotaLimit) * 100, 100)}%` }}
                              />
                            </div>
                          </div>
                          <div className="flex justify-between text-[11px] text-muted-foreground pt-1">
                            <span>Sisa Kuota: <strong>{remaining} request</strong></span>
                            <span>Exp: {m.endDate}</span>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-sm text-muted-foreground leading-6">
                      Belum ada paket maintenance aktif saat ini.
                    </p>
                  )}
                </div>
              </div>

              {/* Recent Notifications */}
              <div className="space-y-6">
                <h2 className="text-xl font-extrabold tracking-tight text-foreground">
                  Notifikasi Terkini
                </h2>
                <div className="space-y-4 border-l border-border pl-4">
                  {data?.notifications && data.notifications.length > 0 ? (
                    data.notifications.slice(0, 5).map((n) => (
                      <div key={n.id} className="relative space-y-1">
                        <span className="absolute -left-[21px] top-1.5 h-2 w-2 rounded-full bg-primary" />
                        <h4 className="text-xs font-bold text-foreground">{n.actorName}</h4>
                        <p className="text-xs text-muted-foreground leading-relaxed">{n.details}</p>
                        <span className="text-[10px] text-muted-foreground/60 block">
                          {new Date(n.createdAt).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit"
                          })}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground leading-6 py-2">
                      Belum ada notifikasi update terbaru.
                    </p>
                  )}
                </div>
              </div>
            </div>

          </div>
        )}
      </div>

      {/* Quick Action Modal Dialog Overlay */}
      {isReportOpen && data?.projects && data.projects.length > 0 && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-primary/30 px-4">
          <div className="w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-xl animate-in fade-in zoom-in-95 duration-200">
            <h2 className="text-xl font-extrabold text-foreground">Laporkan Kendala / Bug</h2>
            <form onSubmit={handleReportSubmit} className="mt-4 space-y-4">
              
              <div className="space-y-3">
                <div className="space-y-1">
                  <label htmlFor="report-project" className="text-xs font-bold text-muted-foreground uppercase">
                    Pilih Project
                  </label>
                  <select
                    id="report-project"
                    required
                    value={selectedProjectId}
                    onChange={(e) => handleProjectSelect(e.target.value)}
                    className="flex h-10 w-full rounded-lg border border-input bg-muted px-3 py-1.5 text-sm focus-visible:outline-none cursor-pointer"
                  >
                    {data.projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label htmlFor="report-maint" className="text-xs font-bold text-muted-foreground uppercase">
                    Pilih Paket / Layanan
                  </label>
                  <select
                    id="report-maint"
                    required
                    value={selectedMaintId}
                    onChange={(e) => setSelectedMaintId(e.target.value)}
                    className="flex h-10 w-full rounded-lg border border-input bg-muted px-3 py-1.5 text-sm focus-visible:outline-none cursor-pointer"
                  >
                    {availableMaintenance.length > 0 ? (
                      availableMaintenance.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.packageName} (Sisa: {m.quotaLimit - m.quotaUsed} request)
                        </option>
                      ))
                    ) : (
                      <option value="">-- Tidak ada paket maintenance aktif dengan sisa kuota --</option>
                    )}
                  </select>
                </div>

                <div className="space-y-1">
                  <label htmlFor="report-desc" className="text-xs font-bold text-muted-foreground uppercase">
                    Deskripsi Masalah / Bug
                  </label>
                  <textarea
                    id="report-desc"
                    required
                    value={reportDesc}
                    onChange={(e) => setReportDesc(e.target.value)}
                    placeholder="Tuliskan deskripsi kendala teknis atau perbaikan yang dibutuhkan secara detail..."
                    className="flex min-h-[100px] w-full rounded-lg border border-input bg-muted p-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  />
                </div>
              </div>

              {reportMutation.isError && (
                <p className="text-xs font-bold text-destructive">
                  {(reportMutation.error as any)?.response?.data?.message || (reportMutation.error as any)?.message || "Gagal mengirim laporan."}
                </p>
              )}

              <div className="flex justify-end gap-2 mt-6">
                <button
                  type="button"
                  onClick={() => setIsReportOpen(false)}
                  className="inline-flex min-h-9 items-center justify-center rounded-lg border border-border bg-secondary px-4 py-2 text-xs font-bold text-foreground hover:bg-border transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={reportMutation.isPending || !selectedMaintId}
                  className="inline-flex min-h-9 items-center justify-center rounded-lg bg-primary px-4 py-2 text-xs font-bold text-primary-foreground transition-all hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 cursor-pointer"
                >
                  {reportMutation.isPending ? "Mengirim..." : "Kirim Laporan"}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
}
