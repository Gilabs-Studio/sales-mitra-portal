"use client";

import { useTranslations } from "next-intl";
import { FolderKanban, FileText, Wrench, Bell, ArrowRight, UserCheck } from "lucide-react";
import { Link } from "@/i18n/routing";
import { AppShell } from "@/features/dashboard/components/app-shell";
import { useAuthGuard } from "@/features/auth/hooks/use-auth";
import { useClientDashboard } from "../hooks/use-client";
import { formatCurrency } from "@/lib/utils";

export function ClientDashboardScreen() {
  const auth = useAuthGuard("client");
  const t = useTranslations("client");
  const dashboard = useClientDashboard();

  if (auth.isLoading || !auth.isAllowed || !auth.user) {
    return <div className="min-h-screen bg-background" />;
  }

  const data = dashboard.data;

  return (
    <AppShell user={auth.user}>
      <div className="space-y-6">
        {/* Welcome Section */}
        <section className="relative overflow-hidden rounded-lg border border-border bg-gradient-to-r from-primary/10 via-primary/5 to-background p-6 lg:p-8">
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-primary">
                Portal GiLabs Klien
              </p>
              <h1 className="mt-2 text-3xl font-extrabold text-foreground tracking-tight md:text-4xl">
                Halo, {auth.user.name}
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
                Selamat datang di pusat pemantauan project Anda. Di sini Anda dapat melihat progres timeline, mengakses deliverable dokumen, memonitor tagihan, serta melacak pemakaian maintenance.
              </p>
            </div>
            <div className="flex shrink-0 gap-3">
              <Link
                href="/client/projects"
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-primary bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 hover:shadow-lg hover:shadow-primary/30 cursor-pointer"
              >
                Monitor Project
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </section>

        {dashboard.isLoading ? (
          <div className="grid gap-4 md:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 animate-pulse rounded-lg bg-muted" />
            ))}
          </div>
        ) : dashboard.isError ? (
          <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4 text-sm font-semibold text-destructive">
            Gagal memuat data dashboard. Silakan coba beberapa saat lagi.
          </div>
        ) : (
          <>
            {/* Summary Metrics */}
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-lg border border-border bg-card p-5 shadow-sm transition-all duration-300 hover:shadow-md">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-muted-foreground">{t("projectCount")}</span>
                  <div className="rounded-md bg-primary/10 p-2 text-primary">
                    <FolderKanban className="h-5 w-5" />
                  </div>
                </div>
                <div className="mt-4">
                  <h3 className="text-3xl font-extrabold text-foreground">{data?.totalProjects}</h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {data?.activeProjects} project aktif berjalan
                  </p>
                </div>
              </div>

              <div className="rounded-lg border border-border bg-card p-5 shadow-sm transition-all duration-300 hover:shadow-md">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-muted-foreground">{t("unpaidInvoices")}</span>
                  <div className="rounded-md bg-destructive/10 p-2 text-destructive">
                    <FileText className="h-5 w-5" />
                  </div>
                </div>
                <div className="mt-4">
                  <h3 className="text-3xl font-extrabold text-foreground">
                    {data?.unpaidInvoicesCount}
                  </h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Tunggakan tagihan: <span className="font-bold text-destructive">{formatCurrency(data?.unpaidInvoicesAmount ?? 0)}</span>
                  </p>
                </div>
              </div>

              <div className="rounded-lg border border-border bg-card p-5 shadow-sm transition-all duration-300 hover:shadow-md">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-muted-foreground">{t("maintenanceQuota")}</span>
                  <div className="rounded-md bg-teal-500/10 p-2 text-teal-600">
                    <Wrench className="h-5 w-5" />
                  </div>
                </div>
                <div className="mt-4">
                  <h3 className="text-3xl font-extrabold text-foreground">
                    {data?.maintenance?.length ?? 0}
                  </h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Paket maintenance aktif saat ini
                  </p>
                </div>
              </div>
            </div>

            {/* Layout Grid */}
            <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
              {/* Left Column: Maintenance Info & Invoice Alerts */}
              <div className="space-y-6">
                {/* Active Maintenance Packages */}
                <section className="rounded-lg border border-border bg-card p-5">
                  <h2 className="text-lg font-extrabold text-foreground flex items-center gap-2">
                    <Wrench className="h-4 w-4 text-teal-600" />
                    Informasi Maintenance Aktif
                  </h2>
                  <div className="mt-4 space-y-4">
                    {data?.maintenance && data.maintenance.length > 0 ? (
                      data.maintenance.map((m) => {
                        const remaining = m.quotaLimit - m.quotaUsed;
                        const project = data.projects.find((p) => p.id === m.projectId);
                        return (
                          <div
                            key={m.id}
                            className="rounded-lg border border-border bg-secondary p-4 transition-all duration-200 hover:-translate-y-0.5"
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="text-sm font-extrabold text-foreground">
                                  {project?.name}
                                </h4>
                                <p className="text-xs text-muted-foreground mt-1">
                                  Paket: {m.packageName}
                                </p>
                              </div>
                              <span className="rounded-full bg-teal-500/15 px-2.5 py-0.5 text-[10px] font-bold text-teal-600">
                                Aktif
                              </span>
                            </div>
                            <div className="mt-4">
                              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                                <span>Pemakaian kuota</span>
                                <span>{m.quotaUsed} / {m.quotaLimit} Request</span>
                              </div>
                              <div className="h-2 w-full rounded-full bg-border overflow-hidden">
                                <div
                                  className="h-full bg-teal-500 rounded-full"
                                  style={{ width: `${Math.min((m.quotaUsed / m.quotaLimit) * 100, 100)}%` }}
                                />
                              </div>
                            </div>
                            <div className="mt-3 flex justify-between text-[11px] text-muted-foreground">
                              <span>Sisa Kuota: <strong>{remaining} request</strong></span>
                              <span>Berlaku hingga: {m.endDate}</span>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-sm text-muted-foreground leading-6">
                        Belum ada paket maintenance yang aktif pada project Anda saat ini.
                      </p>
                    )}
                  </div>
                </section>

                {/* Projects Overview List */}
                <section className="rounded-lg border border-border bg-card p-5">
                  <h2 className="text-lg font-extrabold text-foreground flex items-center gap-2">
                    <FolderKanban className="h-4 w-4 text-primary" />
                    Project Saya
                  </h2>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    {data?.projects && data.projects.length > 0 ? (
                      data.projects.map((p) => (
                        <Link
                          key={p.id}
                          href={`/client/projects/${p.id}`}
                          className="flex flex-col justify-between rounded-lg border border-border bg-secondary p-4 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md cursor-pointer"
                        >
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                              {p.status}
                            </span>
                            <h4 className="mt-1 text-sm font-extrabold text-foreground line-clamp-1">
                              {p.name}
                            </h4>
                            <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                              {p.description}
                            </p>
                          </div>
                          <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-3 text-xs text-muted-foreground">
                            <span>Mulai: {p.startDate}</span>
                            <span className="font-bold text-primary flex items-center gap-1">
                              Detail <ArrowRight className="h-3 w-3" />
                            </span>
                          </div>
                        </Link>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground leading-6 sm:col-span-2">
                        Anda belum memiliki project terdaftar di portal ini.
                      </p>
                    )}
                  </div>
                </section>
              </div>

              {/* Right Column: Notifications / Audit Feed */}
              <aside className="rounded-lg border border-border bg-card p-5 h-fit">
                <h2 className="text-lg font-extrabold text-foreground flex items-center gap-2 mb-4">
                  <Bell className="h-4 w-4 text-primary" />
                  Notifikasi Progres Terbaru
                </h2>
                <div className="relative space-y-4 border-l border-border pl-4">
                  {data?.notifications && data.notifications.length > 0 ? (
                    data.notifications.map((n) => (
                      <div key={n.id} className="relative">
                        <span className="absolute -left-[21px] top-1.5 flex h-2.5 w-2.5 items-center justify-center rounded-full bg-primary ring-4 ring-card" />
                        <div>
                          <p className="text-xs font-bold text-foreground">{n.actorName} ({n.actorRole})</p>
                          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                            {n.details}
                          </p>
                          <p className="mt-1 text-[10px] text-muted-foreground/80">
                            {new Date(n.createdAt).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground leading-6 py-2">
                      Belum ada notifikasi update terbaru.
                    </p>
                  )}
                </div>
              </aside>
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
}
