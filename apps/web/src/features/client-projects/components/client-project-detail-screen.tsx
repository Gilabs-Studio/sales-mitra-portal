"use client";

import * as React from "react";
import {
  Download,
  ExternalLink,
  FileText,
  History,
  ReceiptText,
  Save,
  Send,
  Upload,
  Wrench,
} from "lucide-react";
import { AppShell } from "@/features/dashboard/components/app-shell";
import { useAuthGuard } from "@/features/auth/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  useAdminClientProject,
  useClientProject,
  useCreateMaintenanceLog,
  useCreateProjectDocument,
  useCreateProjectInvoice,
  useCreateProjectProgress,
  useUpdateClientProject,
  useUpsertMaintenancePlan,
} from "../hooks/use-client-projects";
import type {
  ClientProjectDetail,
  DocumentCategory,
  InvoiceStatus,
  MaintenanceStatus,
  ProgressStatus,
  ProjectPayload,
  ProjectStatus,
} from "../types/client-project.types";
import {
  documentCategoryLabels,
  documentCategoryOptions,
  invoiceStatusOptions,
  maintenanceStatusOptions,
  progressStatusOptions,
  projectStatusOptions,
} from "../utils/client-project-labels";
import { formatDateOnly, toDateInputValue } from "../utils/format";
import { StatusPill } from "./status-pill";

type DetailMode = "admin" | "client";

export function ClientProjectDetailScreen({ projectId, mode }: { projectId: string; mode: DetailMode }) {
  const auth = useAuthGuard(mode);
  const adminQuery = useAdminClientProject(mode === "admin" ? projectId : "");
  const clientQuery = useClientProject(mode === "client" ? projectId : "");
  const query = mode === "admin" ? adminQuery : clientQuery;
  const detail = query.data;
  const [selectedDocumentOverride, setSelectedDocumentOverride] = React.useState("");
  const availableDocumentUrls = new Set(detail?.documents.map((doc) => doc.url) ?? []);
  const defaultDocumentUrl = detail?.documents.find((doc) => doc.url.toLowerCase().includes(".pdf"))?.url ?? detail?.documents[0]?.url ?? "";
  const selectedDocumentUrl = availableDocumentUrls.has(selectedDocumentOverride) ? selectedDocumentOverride : defaultDocumentUrl;

  if (auth.isLoading || !auth.isAllowed || !auth.user) {
    return <div className="min-h-screen bg-background" />;
  }

  return (
    <AppShell user={auth.user}>
      <div className="space-y-6">
        {query.isError ? (
          <div className="rounded-lg border border-destructive bg-destructive/5 p-4 text-sm font-semibold text-destructive">
            Detail project gagal dimuat.
          </div>
        ) : null}

        {detail ? (
          <>
            <section className="grid gap-5 lg:grid-cols-[1fr_360px]">
              <div>
                <p className="text-sm font-semibold uppercase text-muted-foreground">
                  {mode === "admin" ? "Admin project workspace" : "Project monitoring"}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-3">
                  <h1 className="text-4xl font-extrabold text-foreground">{detail.project.name}</h1>
                  <StatusPill type="project" status={detail.project.status} />
                </div>
                <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">
                  {detail.project.description || "Belum ada deskripsi project."}
                </p>
              </div>
              <ProjectInfoPanel detail={detail} />
            </section>

            <section className="grid gap-4 lg:grid-cols-[1fr_360px]">
              <div className="space-y-4">
                <ProgressTimeline detail={detail} />
                <DocumentsPanel detail={detail} selectedUrl={selectedDocumentUrl} onSelect={setSelectedDocumentOverride} />
                <InvoicesPanel detail={detail} />
                <MaintenancePanel detail={detail} />
                <ActivityPanel detail={detail} />
              </div>
              <aside className="space-y-4">
                <DeliverablesPanel detail={detail} selectedUrl={selectedDocumentUrl} />
                {mode === "admin" ? <AdminProjectActions detail={detail} /> : null}
              </aside>
            </section>
          </>
        ) : (
          <div className="rounded-lg border border-border bg-card p-6 text-sm text-muted-foreground">
            Memuat detail project...
          </div>
        )}
      </div>
    </AppShell>
  );
}

function ProjectInfoPanel({ detail }: { detail: ClientProjectDetail }) {
  const project = detail.project;
  return (
    <aside className="rounded-lg border border-border bg-card p-5">
      <div className="text-sm font-extrabold text-foreground">Informasi project</div>
      <dl className="mt-4 grid gap-3 text-sm">
        <InfoItem label="Client" value={project.clientName || "-"} />
        <InfoItem label="PIC" value={`${project.picName || "-"} ${project.picEmail ? `(${project.picEmail})` : ""}`} />
        <InfoItem label="Mulai" value={formatDateOnly(project.startDate)} />
        <InfoItem label="Target selesai" value={formatDateOnly(project.targetEndDate)} />
        <InfoItem label="Progress" value={`${project.progressPercent}%`} />
      </dl>
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-secondary">
        <div className="h-full rounded-full bg-primary" style={{ width: `${project.progressPercent}%` }} />
      </div>
    </aside>
  );
}

function InfoItem({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase text-muted-foreground">{label}</dt>
      <dd className="mt-1 font-semibold text-foreground">{value}</dd>
    </div>
  );
}

function ProgressTimeline({ detail }: { detail: ClientProjectDetail }) {
  return (
    <section className="rounded-lg border border-border bg-card p-5">
      <div className="flex items-center gap-2 text-sm font-extrabold text-foreground">
        <History className="h-4 w-4 text-primary" aria-hidden="true" />
        Progress timeline
      </div>
      <div className="mt-5 space-y-4 border-l border-border pl-4">
        {detail.progress.map((item) => (
          <div key={item.id} className="relative rounded-lg border border-border bg-secondary p-4">
            <span className="absolute -left-4 top-5 h-px w-3 bg-border" aria-hidden="true" />
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-extrabold text-foreground">{item.title}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {formatDate(item.updatedAt)} oleh {item.updatedBy || "Admin"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <StatusPill type="progress" status={item.status} />
                <span className="text-sm font-extrabold text-foreground">{item.percentage}%</span>
              </div>
            </div>
            {item.note ? <p className="mt-3 text-sm leading-6 text-muted-foreground">{item.note}</p> : null}
            {item.documentUrl ? (
              <a href={item.documentUrl} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-foreground underline">
                Lampiran
                <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
              </a>
            ) : null}
          </div>
        ))}
        {detail.progress.length === 0 ? <p className="text-sm text-muted-foreground">Belum ada progress timeline.</p> : null}
      </div>
    </section>
  );
}

function DocumentsPanel({
  detail,
  selectedUrl,
  onSelect,
}: {
  detail: ClientProjectDetail;
  selectedUrl: string;
  onSelect: (url: string) => void;
}) {
  return (
    <section className="rounded-lg border border-border bg-card p-5">
      <div className="flex items-center gap-2 text-sm font-extrabold text-foreground">
        <FileText className="h-4 w-4 text-primary" aria-hidden="true" />
        Documents & reports
      </div>
      <div className="mt-4 grid gap-3 lg:grid-cols-[280px_1fr]">
        <div className="space-y-2">
          {detail.documents.map((doc) => (
            <button
              key={doc.id}
              type="button"
              onClick={() => onSelect(doc.url)}
              className={`w-full rounded-lg border px-3 py-2 text-left transition-colors ${
                selectedUrl === doc.url ? "border-primary bg-secondary text-foreground" : "border-border bg-card hover:bg-secondary"
              }`}
            >
              <p className="text-sm font-bold">{doc.title}</p>
              <p className="mt-1 text-xs text-muted-foreground">{documentCategoryLabels[doc.category]}</p>
            </button>
          ))}
          {detail.documents.length === 0 ? <p className="text-sm text-muted-foreground">Belum ada dokumen.</p> : null}
        </div>
        <div className="min-h-[420px] overflow-hidden rounded-lg border border-border bg-secondary">
          {selectedUrl ? (
            selectedUrl.toLowerCase().includes(".pdf") ? (
              <iframe src={selectedUrl} title="PDF preview" className="h-[520px] w-full bg-card" />
            ) : (
              <div className="flex h-[420px] flex-col items-center justify-center gap-3 p-6 text-center">
                <FileText className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
                <p className="max-w-sm text-sm text-muted-foreground">
                  Preview langsung tersedia untuk PDF. File ini bisa dibuka atau di-download melalui tautan.
                </p>
              </div>
            )
          ) : (
            <div className="flex h-[420px] items-center justify-center p-6 text-sm text-muted-foreground">
              Pilih dokumen untuk preview.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function DeliverablesPanel({ detail, selectedUrl }: { detail: ClientProjectDetail; selectedUrl: string }) {
  const project = detail.project;
  return (
    <section className="rounded-lg border border-border bg-card p-5">
      <div className="text-sm font-extrabold text-foreground">Deployment information</div>
      <div className="mt-4 space-y-3">
        <LinkRow label="Website" value={project.websiteUrl} />
        <LinkRow label="Staging" value={project.stagingUrl} />
        <LinkRow label="Dokumentasi" value={project.documentationUrl} />
        {project.credentialNote ? (
          <div>
            <p className="text-xs font-semibold uppercase text-muted-foreground">Credential note</p>
            <p className="mt-1 whitespace-pre-wrap rounded-lg border border-border bg-secondary p-3 text-xs leading-5 text-foreground">
              {project.credentialNote}
            </p>
          </div>
        ) : null}
        {selectedUrl ? (
          <a
            href={selectedUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-primary bg-primary px-3 text-sm font-semibold text-primary-foreground"
          >
            <Download className="h-4 w-4" aria-hidden="true" />
            Download selected file
          </a>
        ) : null}
      </div>
    </section>
  );
}

function LinkRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase text-muted-foreground">{label}</p>
      {value ? (
        <a href={value} target="_blank" rel="noreferrer" className="mt-1 inline-flex items-center gap-1.5 text-sm font-bold text-foreground underline">
          Buka tautan
          <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
        </a>
      ) : (
        <p className="mt-1 text-sm text-muted-foreground">-</p>
      )}
    </div>
  );
}

function MaintenancePanel({ detail }: { detail: ClientProjectDetail }) {
  return (
    <section className="rounded-lg border border-border bg-card p-5">
      <div className="flex items-center gap-2 text-sm font-extrabold text-foreground">
        <Wrench className="h-4 w-4 text-primary" aria-hidden="true" />
        Maintenance management
      </div>
      {detail.maintenance ? (
        <div className="mt-4 rounded-lg border border-border bg-secondary p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-extrabold text-foreground">{detail.maintenance.type}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {formatDateOnly(detail.maintenance.periodStart)} - {formatDateOnly(detail.maintenance.periodEnd)}
              </p>
            </div>
            <p className="text-sm font-extrabold text-foreground">
              {detail.maintenance.quotaUsed}/{detail.maintenance.quotaTotal} terpakai
            </p>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-card">
            <div
              className="h-full rounded-full bg-success"
              style={{
                width: `${detail.maintenance.quotaTotal ? Math.min(100, (detail.maintenance.quotaUsed / detail.maintenance.quotaTotal) * 100) : 0}%`,
              }}
            />
          </div>
        </div>
      ) : (
        <p className="mt-4 text-sm text-muted-foreground">Belum ada paket maintenance.</p>
      )}
      <div className="mt-4 overflow-hidden rounded-lg border border-border">
        <table className="w-full border-collapse text-left text-sm">
          <thead className="bg-secondary text-xs uppercase text-muted-foreground">
            <tr>
              <th className="border-b border-border px-4 py-3">Tanggal</th>
              <th className="border-b border-border px-4 py-3">Request</th>
              <th className="border-b border-border px-4 py-3">PIC</th>
              <th className="border-b border-border px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {detail.maintenanceLogs.map((item) => (
              <tr key={item.id}>
                <td className="border-b border-border px-4 py-3 text-muted-foreground">{formatDateOnly(item.requestDate)}</td>
                <td className="border-b border-border px-4 py-3 font-medium text-foreground">{item.description}</td>
                <td className="border-b border-border px-4 py-3 text-muted-foreground">{item.picName || "-"}</td>
                <td className="border-b border-border px-4 py-3">
                  <StatusPill type="maintenance" status={item.status} />
                </td>
              </tr>
            ))}
            {detail.maintenanceLogs.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-4 text-sm text-muted-foreground">
                  Belum ada audit log maintenance.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function InvoicesPanel({ detail }: { detail: ClientProjectDetail }) {
  return (
    <section className="rounded-lg border border-border bg-card p-5">
      <div className="flex items-center gap-2 text-sm font-extrabold text-foreground">
        <ReceiptText className="h-4 w-4 text-primary" aria-hidden="true" />
        Invoice & billing
      </div>
      <div className="mt-4 overflow-hidden rounded-lg border border-border">
        <table className="w-full border-collapse text-left text-sm">
          <thead className="bg-secondary text-xs uppercase text-muted-foreground">
            <tr>
              <th className="border-b border-border px-4 py-3">Nomor</th>
              <th className="border-b border-border px-4 py-3">Nominal</th>
              <th className="border-b border-border px-4 py-3">Terbit</th>
              <th className="border-b border-border px-4 py-3">Jatuh tempo</th>
              <th className="border-b border-border px-4 py-3">Status</th>
              <th className="border-b border-border px-4 py-3">PDF</th>
            </tr>
          </thead>
          <tbody>
            {detail.invoices.map((invoice) => (
              <tr key={invoice.id}>
                <td className="border-b border-border px-4 py-3 font-bold text-foreground">{invoice.number}</td>
                <td className="border-b border-border px-4 py-3">{formatCurrency(invoice.amount)}</td>
                <td className="border-b border-border px-4 py-3 text-muted-foreground">{formatDateOnly(invoice.issuedAt)}</td>
                <td className="border-b border-border px-4 py-3 text-muted-foreground">{formatDateOnly(invoice.dueAt)}</td>
                <td className="border-b border-border px-4 py-3">
                  <StatusPill type="invoice" status={invoice.status} />
                </td>
                <td className="border-b border-border px-4 py-3">
                  {invoice.documentUrl ? (
                    <a href={invoice.documentUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-xs font-bold underline">
                      Preview
                      <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                    </a>
                  ) : (
                    "-"
                  )}
                </td>
              </tr>
            ))}
            {detail.invoices.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-4 text-sm text-muted-foreground">
                  Belum ada invoice.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function ActivityPanel({ detail }: { detail: ClientProjectDetail }) {
  return (
    <section className="rounded-lg border border-border bg-card p-5">
      <div className="text-sm font-extrabold text-foreground">Activity history</div>
      <div className="mt-4 space-y-3">
        {detail.activities.map((item) => (
          <div key={item.id} className="border-l border-border pl-3">
            <p className="text-sm font-bold text-foreground">{item.action}</p>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">{item.description || "-"}</p>
            <p className="mt-1 text-[10px] font-semibold text-muted-foreground">
              {formatDate(item.createdAt)} {item.actorName ? `oleh ${item.actorName}` : ""}
            </p>
          </div>
        ))}
        {detail.activities.length === 0 ? <p className="text-sm text-muted-foreground">Belum ada activity history.</p> : null}
      </div>
    </section>
  );
}

function AdminProjectActions({ detail }: { detail: ClientProjectDetail }) {
  const projectId = detail.project.id;
  return (
    <section className="rounded-lg border border-border bg-card p-5">
      <div className="text-sm font-extrabold text-foreground">Admin actions</div>
      <div className="mt-4 space-y-5">
        <ProjectUpdateForm key={detail.project.updatedAt} detail={detail} />
        <ProgressForm projectId={projectId} />
        <DocumentForm projectId={projectId} />
        <MaintenancePlanForm projectId={projectId} detail={detail} />
        <MaintenanceLogForm projectId={projectId} />
        <InvoiceForm projectId={projectId} />
      </div>
    </section>
  );
}

function ProjectUpdateForm({ detail }: { detail: ClientProjectDetail }) {
  const project = detail.project;
  const mutation = useUpdateClientProject(project.id);
  const [values, setValues] = React.useState<ProjectPayload>({
    clientId: project.clientId,
    name: project.name,
    description: project.description,
    picName: project.picName,
    picEmail: project.picEmail,
    startDate: toDateInputValue(project.startDate),
    targetEndDate: toDateInputValue(project.targetEndDate),
    status: project.status,
    progressPercent: project.progressPercent,
    websiteUrl: project.websiteUrl,
    stagingUrl: project.stagingUrl,
    credentialNote: project.credentialNote,
    documentationUrl: project.documentationUrl,
  });

  return (
    <form
      className="space-y-3 border-b border-border pb-5"
      onSubmit={(event) => {
        event.preventDefault();
        mutation.mutate(values);
      }}
    >
      <p className="text-xs font-extrabold uppercase text-muted-foreground">Update project</p>
      <Field>
        <FieldLabel>Status</FieldLabel>
        <Select value={values.status} onChange={(event) => setValues({ ...values, status: event.target.value as ProjectStatus })}>
          {projectStatusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      </Field>
      <Field>
        <FieldLabel>Progress %</FieldLabel>
        <Input
          type="number"
          value={values.progressPercent}
          onChange={(event) => setValues({ ...values, progressPercent: Number(event.target.value) })}
        />
      </Field>
      <Field>
        <FieldLabel>Website URL</FieldLabel>
        <Input value={values.websiteUrl} onChange={(event) => setValues({ ...values, websiteUrl: event.target.value })} />
      </Field>
      <Field>
        <FieldLabel>Staging URL</FieldLabel>
        <Input value={values.stagingUrl} onChange={(event) => setValues({ ...values, stagingUrl: event.target.value })} />
      </Field>
      <Field>
        <FieldLabel>Credential note</FieldLabel>
        <Textarea value={values.credentialNote} onChange={(event) => setValues({ ...values, credentialNote: event.target.value })} />
      </Field>
      <Button type="submit" className="w-full" isLoading={mutation.isPending}>
        <Save className="h-4 w-4" aria-hidden="true" />
        Simpan project
      </Button>
      {mutation.error instanceof Error ? <p className="text-xs font-semibold text-destructive">{mutation.error.message}</p> : null}
    </form>
  );
}

function ProgressForm({ projectId }: { projectId: string }) {
  const mutation = useCreateProjectProgress(projectId);
  const [values, setValues] = React.useState({
    title: "",
    status: "in_progress" as ProgressStatus,
    percentage: 0,
    note: "",
    documentUrl: "",
  });
  return (
    <form
      className="space-y-3 border-b border-border pb-5"
      onSubmit={(event) => {
        event.preventDefault();
        mutation.mutate(values, {
          onSuccess: () => setValues({ title: "", status: "in_progress", percentage: 0, note: "", documentUrl: "" }),
        });
      }}
    >
      <p className="text-xs font-extrabold uppercase text-muted-foreground">Tambah progress</p>
      <Input placeholder="Milestone" value={values.title} onChange={(event) => setValues({ ...values, title: event.target.value })} />
      <div className="grid grid-cols-2 gap-2">
        <Select value={values.status} onChange={(event) => setValues({ ...values, status: event.target.value as ProgressStatus })}>
          {progressStatusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
        <Input type="number" value={values.percentage} onChange={(event) => setValues({ ...values, percentage: Number(event.target.value) })} />
      </div>
      <Textarea placeholder="Catatan update" value={values.note} onChange={(event) => setValues({ ...values, note: event.target.value })} />
      <Input placeholder="URL lampiran opsional" value={values.documentUrl} onChange={(event) => setValues({ ...values, documentUrl: event.target.value })} />
      <Button type="submit" className="w-full" isLoading={mutation.isPending}>
        <Send className="h-4 w-4" aria-hidden="true" />
        Simpan progress
      </Button>
    </form>
  );
}

function DocumentForm({ projectId }: { projectId: string }) {
  const mutation = useCreateProjectDocument(projectId);
  const [values, setValues] = React.useState({
    title: "",
    category: "deliverable" as DocumentCategory,
    url: "",
    description: "",
  });
  return (
    <form
      className="space-y-3 border-b border-border pb-5"
      onSubmit={(event) => {
        event.preventDefault();
        mutation.mutate(values, {
          onSuccess: () => setValues({ title: "", category: "deliverable", url: "", description: "" }),
        });
      }}
    >
      <p className="text-xs font-extrabold uppercase text-muted-foreground">Upload dokumen</p>
      <Input placeholder="Judul dokumen" value={values.title} onChange={(event) => setValues({ ...values, title: event.target.value })} />
      <Select value={values.category} onChange={(event) => setValues({ ...values, category: event.target.value as DocumentCategory })}>
        {documentCategoryOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </Select>
      <Input placeholder="URL PDF / file" value={values.url} onChange={(event) => setValues({ ...values, url: event.target.value })} />
      <Textarea placeholder="Deskripsi" value={values.description} onChange={(event) => setValues({ ...values, description: event.target.value })} />
      <Button type="submit" className="w-full" isLoading={mutation.isPending}>
        <Upload className="h-4 w-4" aria-hidden="true" />
        Simpan dokumen
      </Button>
    </form>
  );
}

function MaintenancePlanForm({ projectId, detail }: { projectId: string; detail: ClientProjectDetail }) {
  const mutation = useUpsertMaintenancePlan(projectId);
  const [values, setValues] = React.useState({
    type: detail.maintenance?.type ?? "",
    periodStart: toDateInputValue(detail.maintenance?.periodStart),
    periodEnd: toDateInputValue(detail.maintenance?.periodEnd),
    quotaTotal: detail.maintenance?.quotaTotal ?? 0,
    isActive: detail.maintenance?.isActive ?? true,
  });
  return (
    <form
      className="space-y-3 border-b border-border pb-5"
      onSubmit={(event) => {
        event.preventDefault();
        mutation.mutate(values);
      }}
    >
      <p className="text-xs font-extrabold uppercase text-muted-foreground">Paket maintenance</p>
      <Input placeholder="Jenis maintenance" value={values.type} onChange={(event) => setValues({ ...values, type: event.target.value })} />
      <div className="grid grid-cols-2 gap-2">
        <Input type="date" value={values.periodStart} onChange={(event) => setValues({ ...values, periodStart: event.target.value })} />
        <Input type="date" value={values.periodEnd} onChange={(event) => setValues({ ...values, periodEnd: event.target.value })} />
      </div>
      <Input type="number" value={values.quotaTotal} onChange={(event) => setValues({ ...values, quotaTotal: Number(event.target.value) })} />
      <label className="flex items-center gap-2 text-sm font-semibold text-foreground">
        <input
          type="checkbox"
          checked={values.isActive}
          onChange={(event) => setValues({ ...values, isActive: event.target.checked })}
          className="h-4 w-4"
        />
        Aktif
      </label>
      <Button type="submit" className="w-full" isLoading={mutation.isPending}>
        <Save className="h-4 w-4" aria-hidden="true" />
        Simpan maintenance
      </Button>
    </form>
  );
}

function MaintenanceLogForm({ projectId }: { projectId: string }) {
  const mutation = useCreateMaintenanceLog(projectId);
  const [values, setValues] = React.useState({
    requestDate: new Date().toISOString().slice(0, 10),
    description: "",
    status: "open" as MaintenanceStatus,
    picName: "",
  });
  return (
    <form
      className="space-y-3 border-b border-border pb-5"
      onSubmit={(event) => {
        event.preventDefault();
        mutation.mutate(values, {
          onSuccess: () => setValues({ requestDate: new Date().toISOString().slice(0, 10), description: "", status: "open", picName: "" }),
        });
      }}
    >
      <p className="text-xs font-extrabold uppercase text-muted-foreground">Audit maintenance</p>
      <Input type="date" value={values.requestDate} onChange={(event) => setValues({ ...values, requestDate: event.target.value })} />
      <Textarea placeholder="Deskripsi request" value={values.description} onChange={(event) => setValues({ ...values, description: event.target.value })} />
      <Select value={values.status} onChange={(event) => setValues({ ...values, status: event.target.value as MaintenanceStatus })}>
        {maintenanceStatusOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </Select>
      <Input placeholder="PIC" value={values.picName} onChange={(event) => setValues({ ...values, picName: event.target.value })} />
      <Button type="submit" className="w-full" isLoading={mutation.isPending}>
        <Wrench className="h-4 w-4" aria-hidden="true" />
        Simpan log
      </Button>
    </form>
  );
}

function InvoiceForm({ projectId }: { projectId: string }) {
  const mutation = useCreateProjectInvoice(projectId);
  const [values, setValues] = React.useState({
    number: "",
    amount: 0,
    status: "waiting_payment" as InvoiceStatus,
    issuedAt: new Date().toISOString().slice(0, 10),
    dueAt: "",
    paidAt: "",
    documentUrl: "",
    paymentNote: "",
  });
  return (
    <form
      className="space-y-3"
      onSubmit={(event) => {
        event.preventDefault();
        mutation.mutate(values, {
          onSuccess: () =>
            setValues({
              number: "",
              amount: 0,
              status: "waiting_payment",
              issuedAt: new Date().toISOString().slice(0, 10),
              dueAt: "",
              paidAt: "",
              documentUrl: "",
              paymentNote: "",
            }),
        });
      }}
    >
      <p className="text-xs font-extrabold uppercase text-muted-foreground">Tambah invoice</p>
      <Input placeholder="Nomor invoice" value={values.number} onChange={(event) => setValues({ ...values, number: event.target.value })} />
      <Input type="number" value={values.amount} onChange={(event) => setValues({ ...values, amount: Number(event.target.value) })} />
      <Select value={values.status} onChange={(event) => setValues({ ...values, status: event.target.value as InvoiceStatus })}>
        {invoiceStatusOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </Select>
      <div className="grid grid-cols-2 gap-2">
        <Input type="date" value={values.issuedAt} onChange={(event) => setValues({ ...values, issuedAt: event.target.value })} />
        <Input type="date" value={values.dueAt} onChange={(event) => setValues({ ...values, dueAt: event.target.value })} />
      </div>
      <Input placeholder="URL PDF invoice" value={values.documentUrl} onChange={(event) => setValues({ ...values, documentUrl: event.target.value })} />
      <Textarea placeholder="Catatan pembayaran" value={values.paymentNote} onChange={(event) => setValues({ ...values, paymentNote: event.target.value })} />
      <Button type="submit" className="w-full" isLoading={mutation.isPending}>
        <ReceiptText className="h-4 w-4" aria-hidden="true" />
        Simpan invoice
      </Button>
    </form>
  );
}
