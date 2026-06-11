"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import {
  ArrowLeft,
  Calendar,
  Layers,
  Wrench,
  FileText,
  Clock,
  ExternalLink,
  Download,
  Eye,
  FileSpreadsheet,
  Info,
} from "lucide-react";
import { Link, useRouter } from "@/i18n/routing";
import { AppShell } from "@/features/dashboard/components/app-shell";
import { useAuthGuard } from "@/features/auth/hooks/use-auth";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  useClientProjectDetail,
  useProjectProgress,
  useProjectDocuments,
  useProjectMaintenance,
  useProjectMaintenanceLogs,
  useProjectInvoices,
  useProjectReportData,
} from "../hooks/use-client";
import { formatCurrency, formatDate } from "@/lib/utils";

type TabType = "progress" | "deliverables" | "maintenance" | "invoice" | "reports";

export function ClientProjectDetail({ projectId }: { readonly projectId: string }) {
  const auth = useAuthGuard("client");
  const t = useTranslations("client");
  const [activeTab, setActiveTab] = React.useState<TabType>("progress");
  const [previewPdfUrl, setPreviewPdfUrl] = React.useState<string | null>(null);
  const [previewPdfTitle, setPreviewPdfTitle] = React.useState<string>("");

  const projectQuery = useClientProjectDetail(projectId);
  const progressQuery = useProjectProgress(projectId);
  const docsQuery = useProjectDocuments(projectId);
  const maintenanceQuery = useProjectMaintenance(projectId);
  const maintLogsQuery = useProjectMaintenanceLogs(projectId);
  const invoicesQuery = useProjectInvoices(projectId);
  const reportQuery = useProjectReportData(projectId);

  if (auth.isLoading || !auth.isAllowed || !auth.user) {
    return <div className="min-h-screen bg-background" />;
  }

  const project = projectQuery.data;

  // Handler for opening PDF preview
  const handlePreviewPdf = (url: string, title: string) => {
    setPreviewPdfUrl(url);
    setPreviewPdfTitle(title);
  };

  const handleDownloadReport = () => {
    // Generate simple printable view or print window
    window.print();
  };

  return (
    <AppShell user={auth.user}>
      <div className="space-y-6">
        {/* Back Link & Title */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/client/projects"
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-secondary cursor-pointer transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-primary">
                {project?.status}
              </span>
              <h1 className="text-2xl font-extrabold text-foreground tracking-tight">
                {project?.name}
              </h1>
            </div>
          </div>
        </div>

        {projectQuery.isLoading ? (
          <div className="h-96 animate-pulse rounded-lg bg-muted" />
        ) : projectQuery.isError ? (
          <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4 text-sm font-semibold text-destructive">
            Gagal memuat detail project. Silakan coba kembali.
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
            {/* Main Area (Tabs Content) */}
            <div className="space-y-6">
              {/* Tabs Buttons */}
              <div className="flex border-b border-border overflow-x-auto gap-2">
                {[
                  { id: "progress", label: t("projectProgress"), icon: Clock },
                  { id: "deliverables", label: t("projectDeliverables"), icon: Layers },
                  { id: "maintenance", label: t("projectMaintenance"), icon: Wrench },
                  { id: "invoice", label: t("projectInvoices"), icon: FileText },
                  { id: "reports", label: t("projectReports"), icon: FileSpreadsheet },
                ].map((tab) => {
                  const Icon = tab.icon;
                  const active = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as TabType)}
                      className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-bold transition-all whitespace-nowrap cursor-pointer hover:text-primary ${
                        active
                          ? "border-primary text-primary"
                          : "border-transparent text-muted-foreground"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              {/* Progress Tab */}
              {activeTab === "progress" && (
                <div className="space-y-4">
                  <h3 className="text-lg font-extrabold text-foreground flex items-center gap-2">
                    <Clock className="h-4 w-4 text-primary" />
                    Timeline Milestone Progres
                  </h3>
                  <div className="relative border-l border-border pl-6 ml-4 space-y-6">
                    {progressQuery.isLoading ? (
                      <div className="h-32 animate-pulse bg-muted rounded-md" />
                    ) : progressQuery.data && progressQuery.data.length > 0 ? (
                      progressQuery.data.map((prog) => (
                        <div key={prog.id} className="relative">
                          <span
                            className={`absolute -left-[31px] top-1.5 flex h-4 w-4 items-center justify-center rounded-full ring-4 ring-card ${
                              prog.status === "completed"
                                ? "bg-primary text-white"
                                : prog.status === "in_progress"
                                ? "bg-cyan-500 text-white"
                                : "bg-border text-muted-foreground"
                            }`}
                          />
                          <div className="rounded-lg border border-border bg-card p-4 transition-all hover:shadow-sm">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                              <div>
                                <h4 className="text-sm font-extrabold text-foreground">
                                  {prog.title}
                                </h4>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                  Tanggal update: {prog.updateDate}
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-extrabold text-primary">
                                  {prog.percentage}%
                                </span>
                                <span
                                  className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${
                                    prog.status === "completed"
                                      ? "bg-primary/10 text-primary"
                                      : prog.status === "in_progress"
                                      ? "bg-cyan-500/10 text-cyan-500"
                                      : "bg-muted text-muted-foreground"
                                  }`}
                                >
                                  {prog.status}
                                </span>
                              </div>
                            </div>
                            {prog.notes && (
                              <p className="mt-3 text-xs leading-relaxed text-muted-foreground bg-secondary/50 p-2.5 rounded border border-border/40">
                                {prog.notes}
                              </p>
                            )}
                            {prog.documentUrl && (
                              <div className="mt-3 flex gap-2">
                                <button
                                  onClick={() => handlePreviewPdf(prog.documentUrl!, prog.title)}
                                  className="inline-flex items-center gap-1.5 rounded bg-primary/10 px-2.5 py-1 text-[10px] font-bold text-primary transition-all hover:bg-primary/20 cursor-pointer"
                                >
                                  <Eye className="h-3 w-3" />
                                  {t("preview")}
                                </button>
                                <a
                                  href={prog.documentUrl}
                                  download
                                  className="inline-flex items-center gap-1.5 rounded bg-secondary px-2.5 py-1 text-[10px] font-bold text-foreground transition-all hover:bg-border cursor-pointer"
                                >
                                  <Download className="h-3 w-3" />
                                  {t("download")}
                                </a>
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground leading-6">
                        Belum ada progres timeline yang diupdate oleh admin.
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Deliverables Tab */}
              {activeTab === "deliverables" && (
                <div className="space-y-6">
                  {/* Deployment Links */}
                  <div className="rounded-lg border border-border bg-card p-5">
                    <h3 className="text-md font-extrabold text-foreground mb-4">
                      Informasi Deployment & Website
                    </h3>
                    <div className="grid gap-4 sm:grid-cols-2">
                      {project?.websiteUrl && (
                        <div className="rounded-lg border border-border bg-secondary p-4 flex justify-between items-center transition-all hover:-translate-y-0.5">
                          <div>
                            <p className="text-xs text-muted-foreground">Website Utama (Production)</p>
                            <h4 className="mt-1 text-sm font-extrabold text-foreground line-clamp-1">
                              {project.websiteUrl}
                            </h4>
                          </div>
                          <a
                            href={project.websiteUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-primary hover:opacity-80 cursor-pointer"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </div>
                      )}
                      {project?.stagingUrl && (
                        <div className="rounded-lg border border-border bg-secondary p-4 flex justify-between items-center transition-all hover:-translate-y-0.5">
                          <div>
                            <p className="text-xs text-muted-foreground">Staging / Development Website</p>
                            <h4 className="mt-1 text-sm font-extrabold text-foreground line-clamp-1">
                              {project.stagingUrl}
                            </h4>
                          </div>
                          <a
                            href={project.stagingUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-primary hover:opacity-80 cursor-pointer"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </div>
                      )}
                    </div>

                    {project?.credentials && (
                      <div className="mt-4 rounded-lg border border-border bg-secondary p-4">
                        <h4 className="text-xs font-bold text-foreground">Informasi Akses & Credentials</h4>
                        <pre className="mt-2 text-xs leading-relaxed text-muted-foreground font-mono bg-card p-3 rounded border border-border overflow-x-auto whitespace-pre-wrap">
                          {project.credentials}
                        </pre>
                      </div>
                    )}

                    {project?.documentation && (
                      <div className="mt-4 rounded-lg border border-border bg-secondary p-4">
                        <h4 className="text-xs font-bold text-foreground">Dokumentasi Tambahan</h4>
                        <p className="mt-1 text-xs leading-relaxed text-muted-foreground whitespace-pre-line">
                          {project.documentation}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Documents List */}
                  <div className="rounded-lg border border-border bg-card p-5">
                    <h3 className="text-md font-extrabold text-foreground mb-4">
                      Dokumen Serah Terima & Manual
                    </h3>
                    {docsQuery.isLoading ? (
                      <div className="h-32 animate-pulse bg-muted rounded-md" />
                    ) : docsQuery.data && docsQuery.data.length > 0 ? (
                      <div className="divide-y divide-border/60">
                        {docsQuery.data.map((doc) => (
                          <div
                            key={doc.id}
                            className="flex justify-between items-center py-3.5 transition-colors hover:bg-secondary/20 rounded-md px-2"
                          >
                            <div>
                              <h4 className="text-sm font-bold text-foreground">{doc.title}</h4>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                Diunggah pada: {formatDate(doc.uploadedAt)}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handlePreviewPdf(doc.documentUrl, doc.title)}
                                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground hover:text-primary hover:bg-secondary cursor-pointer transition-colors"
                                title={t("preview")}
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                              <a
                                href={doc.documentUrl}
                                download
                                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground hover:text-primary hover:bg-secondary cursor-pointer transition-colors"
                                title={t("download")}
                              >
                                <Download className="h-4 w-4" />
                              </a>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground leading-6">
                        Belum ada dokumen deliverables/BAST yang diunggah oleh admin.
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Maintenance Tab */}
              {activeTab === "maintenance" && (
                <div className="space-y-6">
                  {/* Quota details */}
                  {maintenanceQuery.isLoading ? (
                    <div className="h-32 animate-pulse bg-muted rounded-md" />
                  ) : maintenanceQuery.data && maintenanceQuery.data.id ? (
                    <div className="rounded-lg border border-border bg-card p-5">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-teal-600">
                            Paket Terdaftar
                          </span>
                          <h3 className="text-lg font-extrabold text-foreground mt-1">
                            {maintenanceQuery.data.packageName}
                          </h3>
                        </div>
                        <span className="rounded-full bg-teal-500/15 px-3 py-0.5 text-xs font-bold text-teal-600">
                          Aktif
                        </span>
                      </div>

                      <div className="mt-5">
                        <div className="flex justify-between text-sm text-muted-foreground mb-1.5">
                          <span>Pemakaian kuota maintenance tahunan</span>
                          <span className="font-extrabold text-foreground">
                            {maintenanceQuery.data.quotaUsed} / {maintenanceQuery.data.quotaLimit} Request
                          </span>
                        </div>
                        <div className="h-3 w-full rounded-full bg-border overflow-hidden">
                          <div
                            className="h-full bg-teal-500 rounded-full transition-all duration-500"
                            style={{
                              width: `${Math.min(
                                (maintenanceQuery.data.quotaUsed / maintenanceQuery.data.quotaLimit) * 100,
                                100
                              )}%`,
                            }}
                          />
                        </div>
                      </div>

                      <div className="mt-4 flex flex-col sm:flex-row justify-between gap-2 text-xs text-muted-foreground border-t border-border/60 pt-4">
                        <span>Sisa Kuota: <strong>{maintenanceQuery.data.quotaLimit - maintenanceQuery.data.quotaUsed} request</strong></span>
                        <span>Periode Aktif: {maintenanceQuery.data.startDate} s/d {maintenanceQuery.data.endDate}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-lg border border-border bg-card p-5 text-center text-muted-foreground">
                      Project Anda belum memiliki paket maintenance yang terdaftar.
                    </div>
                  )}

                  {/* Audit Logs Usage */}
                  <div className="rounded-lg border border-border bg-card p-5">
                    <h3 className="text-md font-extrabold text-foreground mb-4">
                      Histori Pemakaian Maintenance (Audit Log)
                    </h3>
                    {maintLogsQuery.isLoading ? (
                      <div className="h-32 animate-pulse bg-muted rounded-md" />
                    ) : maintLogsQuery.data && maintLogsQuery.data.length > 0 ? (
                      <div className="divide-y divide-border/60">
                        {maintLogsQuery.data.map((ml) => (
                          <div key={ml.id} className="py-3 px-1 hover:bg-secondary/10 rounded-md">
                            <div className="flex justify-between items-start gap-2">
                              <div>
                                <h4 className="text-sm font-bold text-foreground">
                                  {ml.description}
                                </h4>
                                <div className="flex flex-wrap gap-2 text-xs text-muted-foreground mt-1">
                                  <span>Tanggal: {ml.requestDate}</span>
                                  <span>·</span>
                                  <span>PIC Handler: {ml.picName}</span>
                                </div>
                              </div>
                              <span
                                className={`rounded-full px-2.5 py-0.5 text-[9px] font-bold uppercase whitespace-nowrap ${
                                  ml.status === "completed"
                                    ? "bg-primary/15 text-primary"
                                    : ml.status === "in_progress"
                                    ? "bg-cyan-500/15 text-cyan-600"
                                    : "bg-muted text-muted-foreground"
                                }`}
                              >
                                {ml.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground leading-6">
                        Belum ada catatan pemakaian/request maintenance yang diajukan.
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Invoice Tab */}
              {activeTab === "invoice" && (
                <div className="space-y-4">
                  <h3 className="text-lg font-extrabold text-foreground flex items-center gap-2">
                    <FileText className="h-4 w-4 text-primary" />
                    Daftar Invoice & Pembayaran
                  </h3>
                  {invoicesQuery.isLoading ? (
                    <div className="h-32 animate-pulse bg-muted rounded-md" />
                  ) : invoicesQuery.data && invoicesQuery.data.length > 0 ? (
                    <div className="rounded-lg border border-border bg-card overflow-hidden">
                      <ScrollArea orientation="horizontal">
                        <table className="w-full min-w-[700px] border-collapse text-left text-sm">
                          <thead className="bg-secondary text-xs uppercase text-muted-foreground">
                            <tr>
                              <th className="border-b border-border px-4 py-3">No. Invoice</th>
                              <th className="border-b border-border px-4 py-3">Nominal</th>
                              <th className="border-b border-border px-4 py-3">Tgl. Terbit</th>
                              <th className="border-b border-border px-4 py-3">Jatuh Tempo</th>
                              <th className="border-b border-border px-4 py-3">Status</th>
                              <th className="border-b border-border px-4 py-3">Aksi</th>
                            </tr>
                          </thead>
                          <tbody>
                            {invoicesQuery.data.map((inv) => (
                              <tr
                                key={inv.id}
                                className="align-middle hover:bg-secondary/40 transition-colors"
                              >
                                <td className="border-b border-border px-4 py-3 font-semibold text-foreground">
                                  {inv.invoiceNumber}
                                </td>
                                <td className="border-b border-border px-4 py-3 font-semibold text-foreground">
                                  {formatCurrency(inv.amount)}
                                </td>
                                <td className="border-b border-border px-4 py-3 text-muted-foreground">
                                  {inv.issueDate}
                                </td>
                                <td className="border-b border-border px-4 py-3 text-muted-foreground">
                                  {inv.dueDate}
                                </td>
                                <td className="border-b border-border px-4 py-3">
                                  <span
                                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold uppercase ${
                                      inv.status === "paid"
                                        ? "bg-teal-500/10 text-teal-600"
                                        : inv.status === "waiting_payment"
                                        ? "bg-amber-500/10 text-amber-600"
                                        : inv.status === "overdue"
                                        ? "bg-destructive/10 text-destructive"
                                        : "bg-muted text-muted-foreground"
                                    }`}
                                  >
                                    {inv.status}
                                  </span>
                                </td>
                                <td className="border-b border-border px-4 py-3">
                                  {inv.documentUrl ? (
                                    <div className="flex gap-2">
                                      <button
                                        onClick={() => handlePreviewPdf(inv.documentUrl, `Invoice ${inv.invoiceNumber}`)}
                                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground hover:text-primary hover:bg-secondary cursor-pointer transition-colors"
                                        title={t("viewPdf")}
                                      >
                                        <Eye className="h-4 w-4" />
                                      </button>
                                      <a
                                        href={inv.documentUrl}
                                        download
                                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground hover:text-primary hover:bg-secondary cursor-pointer transition-colors"
                                        title={t("downloadPdf")}
                                      >
                                        <Download className="h-4 w-4" />
                                      </a>
                                    </div>
                                  ) : (
                                    <span className="text-xs text-muted-foreground">No PDF</span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </ScrollArea>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground leading-6">
                      Belum ada invoice/billing yang diterbitkan untuk project ini.
                    </p>
                  )}
                </div>
              )}

              {/* Reports Tab */}
              {activeTab === "reports" && (
                <div className="space-y-6">
                  <div className="rounded-lg border border-border bg-card p-5">
                    <h3 className="text-md font-extrabold text-foreground mb-2">
                      Laporan Perkembangan & Pemakaian Layanan
                    </h3>
                    <p className="text-xs text-muted-foreground mb-4">
                      Dapatkan rangkuman data progress, dokumen serah terima, penggunaan maintenance, dan riwayat tagihan invoice untuk kebutuhan pertanggungjawaban internal.
                    </p>
                    <button
                      onClick={handleDownloadReport}
                      className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-primary bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
                    >
                      <Download className="h-4 w-4" />
                      Cetak / Unduh Laporan Project
                    </button>
                  </div>

                  {/* Printable Audit History Frame */}
                  <div className="rounded-lg border border-border bg-card p-5" id="printable-report">
                    <h3 className="text-md font-extrabold text-foreground mb-4">
                      Log Aktivitas Transparansi Project
                    </h3>
                    {reportQuery.isLoading ? (
                      <div className="h-32 animate-pulse bg-muted rounded-md" />
                    ) : reportQuery.data && reportQuery.data.history && reportQuery.data.history.length > 0 ? (
                      <div className="space-y-3">
                        {reportQuery.data.history.map((h: any) => (
                          <div key={h.id} className="text-xs leading-relaxed text-muted-foreground p-3 rounded-lg border border-border bg-secondary flex justify-between gap-4">
                            <div>
                              <p className="font-bold text-foreground">{h.details}</p>
                              <p className="text-[10px] text-muted-foreground mt-0.5">Oleh: {h.actorName} ({h.actorRole})</p>
                            </div>
                            <span className="text-[10px] whitespace-nowrap">
                              {formatDate(h.createdAt)}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground leading-6">
                        Belum ada riwayat aktivitas yang tercatat.
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Right Sidebar (PIC & Metadata info) */}
            <aside className="space-y-6">
              {/* Project Info Panel */}
              <div className="rounded-lg border border-border bg-card p-5">
                <h3 className="text-sm font-extrabold text-foreground uppercase tracking-wider text-muted-foreground mb-4">
                  Metadata Project
                </h3>
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <Calendar className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                    <div>
                      <h4 className="text-xs font-bold text-foreground">{t("startDate")}</h4>
                      <p className="text-xs text-muted-foreground mt-0.5">{project?.startDate}</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Calendar className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                    <div>
                      <h4 className="text-xs font-bold text-foreground">{t("targetEndDate")}</h4>
                      <p className="text-xs text-muted-foreground mt-0.5">{project?.targetEndDate}</p>
                    </div>
                  </div>
                  <div className="border-t border-border/60 my-2" />
                  <div>
                    <h4 className="text-xs font-bold text-foreground">{t("picName")}</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">{project?.picName}</p>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-foreground">{t("picContact")}</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">{project?.picContact}</p>
                  </div>
                </div>
              </div>

              {/* Description Panel */}
              <div className="rounded-lg border border-border bg-card p-5">
                <h3 className="text-sm font-extrabold text-foreground flex items-center gap-1.5 mb-2">
                  <Info className="h-4 w-4 text-primary" />
                  Deskripsi Proyek
                </h3>
                <p className="text-xs leading-relaxed text-muted-foreground whitespace-pre-wrap">
                  {project?.description}
                </p>
              </div>
            </aside>
          </div>
        )}
      </div>

      {/* PDF Preview Modal overlay */}
      {previewPdfUrl && (
        <div className="fixed inset-0 z-[100] flex flex-col justify-between bg-black/60 p-4">
          <div className="flex justify-between items-center bg-card p-3 rounded-t-lg border-b border-border shadow">
            <h3 className="text-sm font-extrabold text-foreground">{previewPdfTitle}</h3>
            <div className="flex gap-2">
              <a
                href={previewPdfUrl}
                download
                className="inline-flex min-h-8 items-center justify-center gap-1 rounded bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground transition-all hover:-translate-y-0.5 cursor-pointer"
              >
                <Download className="h-3 w-3" />
                Unduh
              </a>
              <button
                onClick={() => setPreviewPdfUrl(null)}
                className="inline-flex min-h-8 items-center justify-center rounded bg-secondary px-3 py-1.5 text-xs font-bold text-foreground hover:bg-border transition-colors cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
          <div className="flex-1 bg-card overflow-hidden shadow-2xl relative">
            <iframe
              src={`${previewPdfUrl}`}
              className="w-full h-full border-0"
              title="PDF Handover Viewer"
            />
          </div>
        </div>
      )}
    </AppShell>
  );
}
