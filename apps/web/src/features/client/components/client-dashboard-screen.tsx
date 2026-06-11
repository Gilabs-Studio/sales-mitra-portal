"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { AppShell } from "@/features/dashboard/components/app-shell";
import { useAuthGuard } from "@/features/auth/hooks/use-auth";
import { useClientDashboard, useCreateMaintenanceRequestGeneric, useClientNotifications } from "../hooks/use-client";
import { formatCurrency } from "@/lib/utils";

// ─── Status Badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    active: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    in_progress: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    completed: "bg-muted text-muted-foreground border-border",
    on_hold: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  };
  const labels: Record<string, string> = {
    active: "Aktif",
    in_progress: "Dalam Pengerjaan",
    completed: "Selesai",
    on_hold: "Ditahan",
  };
  return (
    <span className={`inline-flex items-center rounded border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${map[status] ?? "bg-muted text-muted-foreground border-border"}`}>
      {labels[status] ?? status}
    </span>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string | number;
  sub?: string;
  accent?: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-card px-6 py-5 flex flex-col gap-1 min-w-0">
      <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground truncate">{label}</p>
      <p className={`text-3xl font-extrabold tracking-tight truncate ${accent ?? "text-foreground"}`}>{value}</p>
      {sub && <p className="text-xs text-muted-foreground truncate">{sub}</p>}
    </div>
  );
}

export function ClientDashboardScreen() {
  const auth = useAuthGuard("client");
  const t = useTranslations("client");
  const dashboard = useClientDashboard();
  const reportMutation = useCreateMaintenanceRequestGeneric();
  const [notifPage, setNotifPage] = React.useState(1);
  const notificationsQuery = useClientNotifications(notifPage, 8);

  // Quick Action form state
  const [isReportOpen, setIsReportOpen] = React.useState(false);
  const [selectedProjectId, setSelectedProjectId] = React.useState("");
  const [selectedMaintId, setSelectedMaintId] = React.useState("");
  const [reportDesc, setReportDesc] = React.useState("");

  if (auth.isLoading || !auth.isAllowed || !auth.user) {
    return <div className="min-h-screen bg-background" />;
  }

  const data = dashboard.data;

  const handleProjectSelect = (projId: string) => {
    setSelectedProjectId(projId);
    if (data?.maintenance) {
      const filtered = data.maintenance.filter((m) => m.projectId === projId && m.quotaUsed < m.quotaLimit);
      setSelectedMaintId(filtered.length > 0 ? filtered[0].id : "");
    }
  };

  const openReportModal = () => {
    setReportDesc("");
    if (data?.projects && data.projects.length > 0) {
      const firstProjId = data.projects[0].id;
      setSelectedProjectId(firstProjId);
      if (data.maintenance) {
        const filtered = data.maintenance.filter((m) => m.projectId === firstProjId && m.quotaUsed < m.quotaLimit);
        setSelectedMaintId(filtered.length > 0 ? filtered[0].id : "");
      }
    }
    setIsReportOpen(true);
  };

  const handleReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProjectId || !selectedMaintId || !reportDesc.trim()) return;
    reportMutation.mutate(
      { projectId: selectedProjectId, payload: { maintenanceId: selectedMaintId, description: reportDesc } },
      {
        onSuccess: () => {
          setIsReportOpen(false);
          setReportDesc("");
        },
      }
    );
  };

  const availableMaintenance = data?.maintenance?.filter((m) => m.projectId === selectedProjectId && m.quotaUsed < m.quotaLimit) ?? [];

  return (
    <AppShell user={auth.user}>
      {/* ── Page Container ─────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-screen-xl space-y-8 px-6 py-8 font-sans text-foreground lg:px-10">

        {/* ── Header ───────────────────────────────────────────────────────── */}
        <div className="flex items-start justify-between gap-6">
          <div className="space-y-1">
            <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
              Portal Klien GiLabs
            </p>
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground lg:text-4xl">
              Halo, {auth.user.name}
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Pusat pemantauan dan kendali project IT Anda.
            </p>
          </div>
          <button
            onClick={openReportModal}
            disabled={dashboard.isLoading || !data?.projects?.length}
            className="hidden sm:inline-flex shrink-0 min-h-10 items-center justify-center rounded-lg bg-primary px-5 py-2 text-xs font-extrabold text-primary-foreground hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/30 active:translate-y-0 transition-all duration-200 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none"
          >
            Laporkan Kendala / Bug
          </button>
        </div>

        {/* ── Stats Bar ────────────────────────────────────────────────────── */}
        {dashboard.isLoading ? (
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 animate-pulse rounded-lg bg-muted" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard label="Total Project" value={data?.totalProjects ?? 0} />
            <StatCard label="Project Aktif" value={data?.activeProjects ?? 0} accent="text-primary" />
            <StatCard
              label="Invoice Belum Bayar"
              value={data?.unpaidInvoicesCount ?? 0}
              accent={(data?.unpaidInvoicesCount ?? 0) > 0 ? "text-destructive" : "text-foreground"}
            />
            <StatCard
              label="Total Tagihan"
              value={formatCurrency(data?.unpaidInvoicesAmount ?? 0)}
              sub="belum terbayar"
              accent={(data?.unpaidInvoicesAmount ?? 0) > 0 ? "text-destructive" : "text-foreground"}
            />
          </div>
        )}

        {/* ── Main Content: 3 columns on desktop ──────────────────────────── */}
        {dashboard.isError ? (
          <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4 text-sm font-semibold text-destructive">
            Gagal memuat data dashboard.
          </div>
        ) : !dashboard.isLoading && (
          <div className="grid gap-6 lg:grid-cols-3">

            {/* ── Column 1: Projects ──────────────────────────────────────── */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-extrabold tracking-tight text-foreground">Project Saya</h2>
                <Link href="/client/projects" className="text-xs font-semibold text-primary hover:underline cursor-pointer">
                  Lihat Semua →
                </Link>
              </div>
              <div className="flex flex-col gap-3">
                {data?.projects && data.projects.length > 0 ? (
                  data.projects.map((p) => (
                    <Link
                      key={p.id}
                      href={`/client/projects/${p.id}`}
                      className="block rounded-lg border border-border bg-card p-4 hover:bg-secondary/40 hover:border-primary/30 transition-all cursor-pointer group"
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="text-sm font-extrabold text-foreground tracking-tight leading-snug group-hover:text-primary transition-colors line-clamp-1">
                          {p.name}
                        </h3>
                        <StatusBadge status={p.status} />
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed mb-3">
                        {p.description || "—"}
                      </p>
                      <div className="text-[11px] text-muted-foreground border-t border-border/40 pt-2 flex justify-between">
                        <span>Mulai: {p.startDate}</span>
                        <span className="text-primary text-[10px] font-bold">Lihat Detail →</span>
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="rounded-lg border border-dashed border-border p-8 text-center">
                    <p className="text-sm text-muted-foreground">Belum ada project terdaftar.</p>
                  </div>
                )}
              </div>
              {/* Mobile report button */}
              <button
                onClick={openReportModal}
                disabled={!data?.projects?.length}
                className="sm:hidden mt-2 inline-flex w-full min-h-10 items-center justify-center rounded-lg bg-primary px-5 py-2 text-xs font-extrabold text-primary-foreground hover:opacity-90 transition-all cursor-pointer disabled:opacity-40"
              >
                Laporkan Kendala / Bug
              </button>
            </div>

            {/* ── Column 2: Maintenance ───────────────────────────────────── */}
            <div className="flex flex-col gap-4">
              <h2 className="text-base font-extrabold tracking-tight text-foreground">Maintenance Aktif</h2>
              <div className="flex flex-col gap-3">
                {data?.maintenance && data.maintenance.length > 0 ? (
                  data.maintenance.map((m) => {
                    const remaining = m.quotaLimit - m.quotaUsed;
                    const pct = m.quotaLimit > 0 ? Math.min((m.quotaUsed / m.quotaLimit) * 100, 100) : 0;
                    const proj = data.projects.find((p) => p.id === m.projectId);
                    return (
                      <div key={m.id} className="rounded-lg border border-border bg-card p-4 space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground truncate">
                              {proj?.name ?? "—"}
                            </p>
                            <p className="text-sm font-extrabold text-foreground mt-0.5 truncate">{m.packageName}</p>
                          </div>
                          <span className="shrink-0 rounded border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600">
                            Aktif
                          </span>
                        </div>
                        <div className="space-y-1.5">
                          <div className="flex justify-between text-[11px] text-muted-foreground">
                            <span>Kuota Bulan Ini</span>
                            <span className="font-bold text-foreground">{m.quotaUsed}/{m.quotaLimit}</span>
                          </div>
                          <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${pct >= 90 ? "bg-destructive" : pct >= 70 ? "bg-amber-500" : "bg-primary"}`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                        <div className="flex justify-between text-[11px] text-muted-foreground pt-1 border-t border-border/40">
                          <span>Sisa: <strong className="text-foreground">{remaining} req</strong></span>
                          <span>Exp: {m.endDate}</span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="rounded-lg border border-dashed border-border p-8 text-center">
                    <p className="text-sm text-muted-foreground">Belum ada paket maintenance aktif.</p>
                  </div>
                )}
              </div>
            </div>

            {/* ── Column 3: Recent Activity ───────────────────────────────── */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-extrabold tracking-tight text-foreground">Aktivitas Terbaru</h2>
                {notificationsQuery.data && notificationsQuery.data.totalPages > 1 && (
                  <div className="flex gap-1">
                    <button
                      disabled={notifPage <= 1}
                      onClick={() => setNotifPage((p) => Math.max(1, p - 1))}
                      className="inline-flex h-6 w-6 items-center justify-center rounded border border-border text-[10px] font-bold disabled:opacity-40 cursor-pointer hover:bg-secondary transition-colors"
                    >‹</button>
                    <button
                      disabled={notifPage >= notificationsQuery.data.totalPages}
                      onClick={() => setNotifPage((p) => p + 1)}
                      className="inline-flex h-6 w-6 items-center justify-center rounded border border-border text-[10px] font-bold disabled:opacity-40 cursor-pointer hover:bg-secondary transition-colors"
                    >›</button>
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-2">
                {notificationsQuery.isLoading ? (
                  <div className="h-64 animate-pulse rounded-lg bg-muted" />
                ) : notificationsQuery.data?.data && notificationsQuery.data.data.length > 0 ? (
                  notificationsQuery.data.data.map((n: any) => (
                    <div
                      key={n.id}
                      className="rounded-lg border border-border bg-card px-4 py-3 space-y-1 hover:bg-secondary/30 transition-colors"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-primary truncate">
                          {n.action}
                        </span>
                        <span className="shrink-0 text-[10px] text-muted-foreground/70">
                          {new Date(n.createdAt).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                          })}
                        </span>
                      </div>
                      <p className="text-xs text-foreground leading-relaxed line-clamp-2">{n.details}</p>
                      <p className="text-[10px] text-muted-foreground">oleh {n.actorName}</p>
                    </div>
                  ))
                ) : (
                  <div className="rounded-lg border border-dashed border-border p-8 text-center">
                    <p className="text-sm text-muted-foreground">Belum ada aktivitas terbaru.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Report Modal ───────────────────────────────────────────────────── */}
      {isReportOpen && data?.projects && data.projects.length > 0 && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 px-4 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) setIsReportOpen(false); }}
        >
          <div className="w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-2xl">
            <h2 className="text-lg font-extrabold text-foreground mb-1">Laporkan Kendala / Bug</h2>
            <p className="text-xs text-muted-foreground mb-5">Permintaan akan dikirim ke tim maintenance Anda.</p>

            <form onSubmit={handleReportSubmit} className="space-y-4">
              <div className="space-y-1">
                <label htmlFor="report-project" className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                  Project
                </label>
                <select
                  id="report-project"
                  required
                  value={selectedProjectId}
                  onChange={(e) => handleProjectSelect(e.target.value)}
                  className="flex h-10 w-full rounded-lg border border-input bg-muted px-3 text-sm focus-visible:outline-none cursor-pointer"
                >
                  {data.projects.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label htmlFor="report-maint" className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                  Paket Maintenance
                </label>
                <select
                  id="report-maint"
                  required
                  value={selectedMaintId}
                  onChange={(e) => setSelectedMaintId(e.target.value)}
                  className="flex h-10 w-full rounded-lg border border-input bg-muted px-3 text-sm focus-visible:outline-none cursor-pointer"
                >
                  {availableMaintenance.length > 0 ? (
                    availableMaintenance.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.packageName} (Sisa: {m.quotaLimit - m.quotaUsed} req)
                      </option>
                    ))
                  ) : (
                    <option value="">-- Tidak ada paket dengan sisa kuota --</option>
                  )}
                </select>
              </div>

              <div className="space-y-1">
                <label htmlFor="report-desc" className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                  Deskripsi Masalah
                </label>
                <textarea
                  id="report-desc"
                  required
                  value={reportDesc}
                  onChange={(e) => setReportDesc(e.target.value)}
                  placeholder="Jelaskan kendala atau bug secara detail..."
                  className="flex min-h-[100px] w-full rounded-lg border border-input bg-muted p-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
              </div>

              {reportMutation.isError && (
                <p className="text-xs font-bold text-destructive">
                  {(reportMutation.error as any)?.response?.data?.message ?? "Gagal mengirim laporan."}
                </p>
              )}

              {reportMutation.isSuccess && (
                <p className="text-xs font-bold text-emerald-600">Laporan berhasil dikirim!</p>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsReportOpen(false)}
                  className="inline-flex min-h-9 items-center justify-center rounded-lg border border-border bg-secondary px-4 text-xs font-bold hover:bg-border transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={reportMutation.isPending || !selectedMaintId}
                  className="inline-flex min-h-9 items-center justify-center rounded-lg bg-primary px-4 text-xs font-bold text-primary-foreground hover:-translate-y-0.5 hover:shadow-md hover:shadow-primary/30 active:translate-y-0 transition-all disabled:opacity-50 cursor-pointer"
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
