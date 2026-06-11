"use client";

import * as React from "react";
import { ArrowLeft, FolderPlus, Mail, MessageCircle, RotateCcw, UserRound } from "lucide-react";
import { AppShell } from "@/features/dashboard/components/app-shell";
import { useAuthGuard } from "@/features/auth/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/routing";
import { formatDate } from "@/lib/utils";
import { useAdminClient, useSendClientInvitation } from "../hooks/use-client-projects";
import { ProjectFormDialog } from "./project-form-dialog";
import { ProjectTable } from "./project-table";

export function AdminClientDetailScreen({ clientId }: { clientId: string }) {
  const auth = useAuthGuard("admin");
  const clientDetail = useAdminClient(clientId);
  const invitation = useSendClientInvitation();
  const [projectDialogOpen, setProjectDialogOpen] = React.useState(false);

  if (auth.isLoading || !auth.isAllowed || !auth.user) {
    return <div className="min-h-screen bg-background" />;
  }

  const detail = clientDetail.data;

  return (
    <AppShell user={auth.user}>
      <div className="space-y-6">
        <Link href="/admin/clients" className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Kembali ke daftar client
        </Link>

        {clientDetail.isError ? (
          <div className="rounded-lg border border-destructive bg-destructive/5 p-4 text-sm font-semibold text-destructive">
            Detail client gagal dimuat.
          </div>
        ) : null}

        {detail ? (
          <>
            <section className="grid gap-5 lg:grid-cols-[1fr_360px]">
              <div>
                <p className="text-sm font-semibold uppercase text-muted-foreground">Client detail</p>
                <h1 className="mt-2 text-4xl font-extrabold text-foreground">{detail.client.name}</h1>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
                  Kelola project, akses portal, dan invitation untuk client ini dari satu workspace.
                </p>
              </div>
              <aside className="rounded-lg border border-border bg-card p-5">
                <div className="flex items-center gap-2 text-sm font-extrabold text-foreground">
                  <UserRound className="h-4 w-4 text-primary" aria-hidden="true" />
                  Akun client
                </div>
                <dl className="mt-4 space-y-3 text-sm">
                  <InfoItem label="Email" value={detail.client.email} />
                  <InfoItem label="Terdaftar" value={formatDate(detail.client.createdAt)} />
                  <InfoItem label="Total project" value={detail.projects.length} />
                </dl>
                <div className="mt-5 grid gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    isLoading={invitation.isPending}
                    onClick={() => invitation.mutate(detail.client.id)}
                  >
                    <RotateCcw className="h-4 w-4" aria-hidden="true" />
                    Kirim/reset akses email
                  </Button>
                  <a
                    href={`mailto:${detail.client.email}?subject=Akses Portal GiLabs&body=Halo ${encodeURIComponent(detail.client.name)},%0D%0A%0D%0AAkun Portal GiLabs Anda sudah dibuat. Silakan buka halaman Client Portal GiLabs dan login memakai email ini.%0D%0A%0D%0ATerima kasih.`}
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-border bg-secondary px-4 py-2 text-sm font-semibold text-foreground transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#e8e6dc] active:translate-y-0"
                  >
                    <Mail className="h-4 w-4" aria-hidden="true" />
                    Email manual
                  </a>
                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(`Halo ${detail.client.name}, akun Portal GiLabs Anda sudah dibuat. Silakan buka halaman Client Portal GiLabs dan login memakai email ${detail.client.email}.`)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-border bg-secondary px-4 py-2 text-sm font-semibold text-foreground transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#e8e6dc] active:translate-y-0"
                  >
                    <MessageCircle className="h-4 w-4" aria-hidden="true" />
                    Share WhatsApp
                  </a>
                </div>
              </aside>
            </section>

            <section className="space-y-3">
              <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
                <div>
                  <h2 className="text-lg font-extrabold text-foreground">Project client</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Flow admin: create client, buka detail client, lalu create project dan sistem mengirim update ke email client.
                  </p>
                </div>
                <Button type="button" onClick={() => setProjectDialogOpen(true)}>
                  <FolderPlus className="h-4 w-4" aria-hidden="true" />
                  Tambah project
                </Button>
              </div>
              <ProjectTable projects={detail.projects} role="admin" />
            </section>

            <ProjectFormDialog
              open={projectDialogOpen}
              clientId={detail.client.id}
              clientName={detail.client.name}
              onOpenChange={setProjectDialogOpen}
            />
          </>
        ) : (
          <div className="rounded-lg border border-border bg-card p-6 text-sm text-muted-foreground">
            Memuat detail client...
          </div>
        )}
      </div>
    </AppShell>
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
