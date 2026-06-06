"use client";

import { Edit3, FolderTree, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DeleteDialog } from "@/components/ui/delete-dialog";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useAdminServices, useDeleteServiceAction, useServiceAdminForm } from "../hooks/use-services";
import { useServiceUIStore } from "../stores/use-service-ui-store";
import { serviceBudgetLabel } from "../utils/service-format";

export function ServiceAdminPanel() {
  const services = useAdminServices();
  const formState = useServiceAdminForm();
  const deleteAction = useDeleteServiceAction();
  const setEditingService = useServiceUIStore((state) => state.setEditingService);
  const setDeletingService = useServiceUIStore((state) => state.setDeletingService);
  const {
    register,
    formState: { errors },
  } = formState.form;

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,0.95fr)_minmax(360px,1fr)]">
      <Card className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase text-muted-foreground">Service tree</p>
            <h2 className="mt-2 text-2xl font-extrabold text-foreground">Katalog layanan</h2>
          </div>
          <Button type="button" variant="secondary" onClick={() => setEditingService(null)}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            Baru
          </Button>
        </div>

        {services.isError ? <p className="text-sm font-semibold text-destructive">Layanan gagal dimuat</p> : null}

        <div className="rounded-lg border border-border bg-secondary/70 p-4">
          <div className="flex items-center gap-2 text-sm font-extrabold text-foreground">
            <FolderTree className="h-4 w-4" aria-hidden="true" />
            GiLabs service catalog
          </div>
          <div className="mt-4 space-y-3 border-l border-border pl-4">
            {(services.data ?? []).map((service) => (
              <div key={service.type} className="relative">
                <span className="absolute -left-4 top-5 h-px w-3 bg-border" aria-hidden="true" />
                <div
                  className={cn(
                    "rounded-lg border bg-card p-4",
                    service.isActive ? "border-border" : "border-dashed border-muted-foreground/40 opacity-70",
                  )}
                >
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <p className="font-extrabold text-foreground">{service.label}</p>
                      <p className="mt-1 text-xs font-semibold text-muted-foreground">{service.type}</p>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">{service.description}</p>
                      <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold">
                        <span className="rounded-lg border border-border bg-secondary px-2.5 py-1">
                          {serviceBudgetLabel(service)}
                        </span>
                        <span className="rounded-lg border border-border bg-secondary px-2.5 py-1">
                          {service.requiresDiscovery ? "Discovery wajib" : "Budget gate"}
                        </span>
                        <span className="rounded-lg border border-border bg-secondary px-2.5 py-1">
                          {service.isActive ? "Aktif" : "Nonaktif"}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button type="button" variant="secondary" onClick={() => setEditingService(service)} aria-label="Edit layanan">
                        <Edit3 className="h-4 w-4" aria-hidden="true" />
                      </Button>
                      <Button type="button" variant="danger" onClick={() => setDeletingService(service)} aria-label="Hapus layanan">
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {services.data?.length === 0 ? <p className="text-sm text-muted-foreground">Belum ada layanan</p> : null}
          </div>
        </div>
      </Card>

      <Card>
        <p className="text-xs font-semibold uppercase text-muted-foreground">
          {formState.editingService ? "Edit layanan" : "Tambah layanan"}
        </p>
        <h2 className="mt-2 text-2xl font-extrabold text-foreground">
          {formState.editingService ? formState.editingService.label : "Rule kualifikasi baru"}
        </h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Atur budget minimum, kebutuhan discovery, dan status aktif untuk menjaga kualitas lead mitra
        </p>

        <form className="mt-5 space-y-4" onSubmit={formState.onSubmit}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="type">Kode layanan</FieldLabel>
              <Input id="type" readOnly={Boolean(formState.editingService)} {...register("type")} />
              <FieldDescription>Contoh `company_profile` atau `other`</FieldDescription>
              {errors.type ? <FieldError>{errors.type.message}</FieldError> : null}
            </Field>
            <Field>
              <FieldLabel htmlFor="label">Nama layanan</FieldLabel>
              <Input id="label" {...register("label")} />
              {errors.label ? <FieldError>{errors.label.message}</FieldError> : null}
            </Field>
            <Field>
              <FieldLabel htmlFor="description">Deskripsi</FieldLabel>
              <Textarea id="description" rows={4} {...register("description")} />
              {errors.description ? <FieldError>{errors.description.message}</FieldError> : null}
            </Field>
            <Field>
              <FieldLabel htmlFor="minimumBudget">Budget minimum</FieldLabel>
              <Input id="minimumBudget" type="number" min={0} {...register("minimumBudget")} />
              {errors.minimumBudget ? <FieldError>{errors.minimumBudget.message}</FieldError> : null}
            </Field>
          </FieldGroup>

          <div className="grid gap-3 md:grid-cols-2">
            <label className="flex min-h-12 items-center gap-3 rounded-lg border border-border bg-secondary px-3 text-sm font-semibold text-foreground">
              <input type="checkbox" className="h-4 w-4 accent-primary" {...register("requiresDiscovery")} />
              Wajib discovery
            </label>
            <label className="flex min-h-12 items-center gap-3 rounded-lg border border-border bg-secondary px-3 text-sm font-semibold text-foreground">
              <input type="checkbox" className="h-4 w-4 accent-primary" {...register("isActive")} />
              Aktif
            </label>
          </div>

          {formState.errorMessage ? <p className="text-sm font-semibold text-destructive">{formState.errorMessage}</p> : null}
          {deleteAction.errorMessage ? <p className="text-sm font-semibold text-destructive">{deleteAction.errorMessage}</p> : null}

          <div className="flex flex-wrap justify-end gap-2">
            {formState.editingService ? (
              <Button type="button" variant="secondary" onClick={formState.onCancel}>
                Batal
              </Button>
            ) : null}
            <Button type="submit" isLoading={formState.isLoading}>
              Simpan layanan
            </Button>
          </div>
        </form>
      </Card>

      <DeleteDialog
        open={Boolean(deleteAction.deletingService)}
        itemName={deleteAction.deletingService?.label ?? "layanan"}
        onOpenChange={(open) => {
          if (!open) {
            deleteAction.setDeletingService(null);
          }
        }}
        onConfirm={deleteAction.onConfirm}
      />
    </div>
  );
}
