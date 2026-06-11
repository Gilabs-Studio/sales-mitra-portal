"use client";

import { FolderKanban } from "lucide-react";
import { AppShell } from "@/features/dashboard/components/app-shell";
import { useAuthGuard } from "@/features/auth/hooks/use-auth";
import { useClientProjects } from "../hooks/use-client-projects";
import { ProjectTable } from "./project-table";

export function ClientProjectListScreen() {
  const auth = useAuthGuard("client");
  const projects = useClientProjects();

  if (auth.isLoading || !auth.isAllowed || !auth.user) {
    return <div className="min-h-screen bg-background" />;
  }

  return (
    <AppShell user={auth.user}>
      <div className="space-y-6">
        <div>
          <p className="text-sm font-semibold uppercase text-muted-foreground">Client workspace</p>
          <h1 className="mt-2 text-4xl font-extrabold text-foreground">Project monitoring</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
            Semua project yang terhubung ke akun Anda, termasuk progress, dokumen, maintenance, invoice, dan activity history.
          </p>
        </div>
        {projects.isError ? (
          <div className="rounded-lg border border-destructive bg-destructive/5 p-4 text-sm font-semibold text-destructive">
            Daftar project gagal dimuat.
          </div>
        ) : null}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <FolderKanban className="h-4 w-4 text-primary" aria-hidden="true" />
            <h2 className="text-lg font-extrabold text-foreground">Daftar project</h2>
          </div>
          <ProjectTable projects={projects.data ?? []} role="client" />
        </section>
      </div>
    </AppShell>
  );
}
