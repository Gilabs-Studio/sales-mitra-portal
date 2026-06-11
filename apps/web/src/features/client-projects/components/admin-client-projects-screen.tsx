"use client";

import * as React from "react";
import { FolderPlus, FolderKanban } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { AppShell } from "@/features/dashboard/components/app-shell";
import { useAuthGuard } from "@/features/auth/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  useAdminClientProjects,
  useAdminClients,
  useCreateClientProject,
} from "../hooks/use-client-projects";
import type { ProjectPayload, ProjectStatus } from "../types/client-project.types";
import { projectStatusOptions } from "../utils/client-project-labels";
import { ProjectTable } from "./project-table";

export function AdminClientProjectsScreen() {
  const auth = useAuthGuard("admin");
  const searchParams = useSearchParams();
  const clientId = searchParams.get("clientId") ?? undefined;
  const clients = useAdminClients(1, 100);
  const projects = useAdminClientProjects(clientId);

  if (auth.isLoading || !auth.isAllowed || !auth.user) {
    return <div className="min-h-screen bg-background" />;
  }

  return (
    <AppShell user={auth.user}>
      <div className="space-y-6">
        <div>
          <p className="text-sm font-semibold uppercase text-muted-foreground">Project progress management</p>
          <h1 className="mt-2 text-4xl font-extrabold text-foreground">Kelola project client</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
            Hubungkan client dengan project, atur status delivery, dan lanjutkan update progress, maintenance, dokumen, serta invoice dari halaman detail.
          </p>
        </div>

        <div className="grid gap-4 xl:grid-cols-[420px_1fr]">
          <CreateProjectPanel key={clientId ?? "all"} clients={clients.data?.data ?? []} defaultClientId={clientId ?? ""} />
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <FolderKanban className="h-4 w-4 text-primary" aria-hidden="true" />
              <h2 className="text-lg font-extrabold text-foreground">Daftar project</h2>
            </div>
            {projects.isError ? (
              <div className="rounded-lg border border-destructive bg-destructive/5 p-4 text-sm font-semibold text-destructive">
                Project client gagal dimuat.
              </div>
            ) : null}
            <ProjectTable projects={projects.data ?? []} role="admin" />
          </section>
        </div>
      </div>
    </AppShell>
  );
}

function CreateProjectPanel({
  clients,
  defaultClientId,
}: {
  clients: Array<{ id: string; name: string; email: string }>;
  defaultClientId: string;
}) {
  const createProject = useCreateClientProject();
  const [values, setValues] = React.useState<ProjectPayload>({
    clientId: defaultClientId,
    name: "",
    description: "",
    picName: "",
    picEmail: "",
    startDate: "",
    targetEndDate: "",
    status: "discovery",
    progressPercent: 0,
    websiteUrl: "",
    stagingUrl: "",
    credentialNote: "",
    documentationUrl: "",
  });

  return (
    <section className="rounded-lg border border-border bg-card p-5">
      <div className="flex items-center gap-2 text-sm font-extrabold text-foreground">
        <FolderPlus className="h-4 w-4 text-primary" aria-hidden="true" />
        Tambah project
      </div>
      <form
        className="mt-4 space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          createProject.mutate(values, {
            onSuccess: () =>
              setValues({
                clientId: defaultClientId,
                name: "",
                description: "",
                picName: "",
                picEmail: "",
                startDate: "",
                targetEndDate: "",
                status: "discovery",
                progressPercent: 0,
                websiteUrl: "",
                stagingUrl: "",
                credentialNote: "",
                documentationUrl: "",
              }),
          });
        }}
      >
        <Field>
          <FieldLabel>Client</FieldLabel>
          <Select value={values.clientId} onChange={(event) => setValues({ ...values, clientId: event.target.value })}>
            <option value="">Pilih client</option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.name} - {client.email}
              </option>
            ))}
          </Select>
        </Field>
        <Field>
          <FieldLabel>Nama project</FieldLabel>
          <Input value={values.name} onChange={(event) => setValues({ ...values, name: event.target.value })} />
        </Field>
        <Field>
          <FieldLabel>Deskripsi</FieldLabel>
          <Textarea value={values.description} onChange={(event) => setValues({ ...values, description: event.target.value })} />
        </Field>
        <div className="grid grid-cols-2 gap-2">
          <Field>
            <FieldLabel>PIC</FieldLabel>
            <Input value={values.picName} onChange={(event) => setValues({ ...values, picName: event.target.value })} />
          </Field>
          <Field>
            <FieldLabel>Email PIC</FieldLabel>
            <Input value={values.picEmail} onChange={(event) => setValues({ ...values, picEmail: event.target.value })} />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Field>
            <FieldLabel>Mulai</FieldLabel>
            <Input type="date" value={values.startDate} onChange={(event) => setValues({ ...values, startDate: event.target.value })} />
          </Field>
          <Field>
            <FieldLabel>Target</FieldLabel>
            <Input type="date" value={values.targetEndDate} onChange={(event) => setValues({ ...values, targetEndDate: event.target.value })} />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-2">
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
        </div>
        <Button type="submit" className="w-full" isLoading={createProject.isPending}>
          <FolderPlus className="h-4 w-4" aria-hidden="true" />
          Buat project
        </Button>
        {createProject.error instanceof Error ? (
          <p className="text-xs font-semibold text-destructive">{createProject.error.message}</p>
        ) : null}
      </form>
    </section>
  );
}
