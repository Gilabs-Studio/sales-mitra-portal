"use client";

import * as React from "react";
import { FolderPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useCreateClientProject } from "../hooks/use-client-projects";
import type { ProjectPayload, ProjectStatus } from "../types/client-project.types";
import { projectStatusOptions } from "../utils/client-project-labels";

type ProjectFormDialogProps = {
  open: boolean;
  clientId: string;
  clientName: string;
  onOpenChange: (open: boolean) => void;
};

const emptyProject = (clientId: string): ProjectPayload => ({
  clientId,
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

export function ProjectFormDialog({ open, clientId, clientName, onOpenChange }: ProjectFormDialogProps) {
  const createProject = useCreateClientProject();
  const [values, setValues] = React.useState<ProjectPayload>(() => emptyProject(clientId));

  if (!open) {
    return null;
  }

  const reset = () => setValues(emptyProject(clientId));

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-primary/30 px-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg border border-border bg-card p-5 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-extrabold text-foreground">Tambah project</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Project baru akan langsung terhubung ke akun {clientName}.
            </p>
          </div>
          <FolderPlus className="h-5 w-5 text-primary" aria-hidden="true" />
        </div>

        <form
          className="mt-5 space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            createProject.mutate(values, {
              onSuccess: () => {
                reset();
                onOpenChange(false);
              },
            });
          }}
        >
          <Field>
            <FieldLabel>Nama project</FieldLabel>
            <Input value={values.name} onChange={(event) => setValues({ ...values, name: event.target.value })} />
          </Field>
          <Field>
            <FieldLabel>Deskripsi</FieldLabel>
            <Textarea value={values.description} onChange={(event) => setValues({ ...values, description: event.target.value })} />
          </Field>
          <div className="grid gap-3 md:grid-cols-2">
            <Field>
              <FieldLabel>PIC</FieldLabel>
              <Input value={values.picName} onChange={(event) => setValues({ ...values, picName: event.target.value })} />
            </Field>
            <Field>
              <FieldLabel>Email PIC</FieldLabel>
              <Input value={values.picEmail} onChange={(event) => setValues({ ...values, picEmail: event.target.value })} />
            </Field>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <Field>
              <FieldLabel>Mulai</FieldLabel>
              <Input type="date" value={values.startDate} onChange={(event) => setValues({ ...values, startDate: event.target.value })} />
            </Field>
            <Field>
              <FieldLabel>Target selesai</FieldLabel>
              <Input type="date" value={values.targetEndDate} onChange={(event) => setValues({ ...values, targetEndDate: event.target.value })} />
            </Field>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
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
          <div className="grid gap-3 md:grid-cols-2">
            <Field>
              <FieldLabel>Website URL</FieldLabel>
              <Input value={values.websiteUrl} onChange={(event) => setValues({ ...values, websiteUrl: event.target.value })} />
            </Field>
            <Field>
              <FieldLabel>Staging URL</FieldLabel>
              <Input value={values.stagingUrl} onChange={(event) => setValues({ ...values, stagingUrl: event.target.value })} />
            </Field>
          </div>
          <Field>
            <FieldLabel>Dokumentasi URL</FieldLabel>
            <Input value={values.documentationUrl} onChange={(event) => setValues({ ...values, documentationUrl: event.target.value })} />
          </Field>
          <Field>
            <FieldLabel>Credential note</FieldLabel>
            <Textarea value={values.credentialNote} onChange={(event) => setValues({ ...values, credentialNote: event.target.value })} />
          </Field>
          {createProject.error instanceof Error ? (
            <p className="text-xs font-semibold text-destructive">{createProject.error.message}</p>
          ) : null}
          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
              Batal
            </Button>
            <Button type="submit" isLoading={createProject.isPending}>
              <FolderPlus className="h-4 w-4" aria-hidden="true" />
              Buat project
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
