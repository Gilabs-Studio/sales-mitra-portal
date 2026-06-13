"use client";

import { Edit3, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DeleteDialog } from "@/components/ui/delete-dialog";
import {
  Dialog,
  DialogContent,
  DialogOverlay,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogBody,
  DialogFooter,
} from "@/components/ui/dialog";
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

  const isFormOpen = useServiceUIStore((state) => state.isFormOpen);
  const setIsFormOpen = useServiceUIStore((state) => state.setIsFormOpen);
  const setEditingService = useServiceUIStore((state) => state.setEditingService);
  const setDeletingService = useServiceUIStore((state) => state.setDeletingService);

  const {
    register,
    formState: { errors },
  } = formState.form;

  return (
    <div className="space-y-6">
      {/* List Header Section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-foreground">Daftar Layanan Aktif</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Menampilkan total {services.data?.length ?? 0} layanan dalam katalog sistem.
          </p>
        </div>
        <Button
          type="button"
          onClick={() => {
            setEditingService(null);
            setIsFormOpen(true);
          }}
          className="cursor-pointer transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 hover:shadow-lg hover:shadow-primary/30"
        >
          <Plus className="h-4 w-4 mr-1" aria-hidden="true" />
          Tambah Layanan Baru
        </Button>
      </div>

      {services.isError ? (
        <p className="text-sm font-semibold text-destructive">Layanan gagal dimuat</p>
      ) : null}

      {/* Modern Services Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {(services.data ?? []).map((service) => (
          <div
            key={service.type}
            className={cn(
              "group relative flex flex-col justify-between rounded-lg bg-secondary/60 p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/5 border border-border/10",
              !service.isActive && "opacity-75 bg-secondary/30",
            )}
          >
            <div>
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <h3 className="font-extrabold text-base text-foreground leading-snug truncate" title={service.label}>
                    {service.label}
                  </h3>
                  <code className="text-[9px] font-mono font-bold text-primary/60 uppercase tracking-wider bg-secondary px-1.5 py-0.5 rounded mt-1 inline-block">
                    {service.type}
                  </code>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingService(service);
                      setIsFormOpen(true);
                    }}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-secondary cursor-pointer transition-colors"
                    aria-label="Edit layanan"
                  >
                    <Edit3 className="h-4 w-4" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeletingService(service)}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border bg-card text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer transition-colors"
                    aria-label="Hapus layanan"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              </div>
              <p className="mt-3 text-xs leading-relaxed text-muted-foreground line-clamp-3" title={service.description}>
                {service.description}
              </p>
            </div>

            <div className="mt-5 pt-3 border-t border-border/30 flex flex-wrap gap-1.5">
              <span className="rounded bg-primary/5 text-primary border border-primary/10 px-2 py-0.5 text-[10px] font-bold">
                {serviceBudgetLabel(service)}
              </span>
              <span
                className={cn(
                  "rounded border px-2 py-0.5 text-[10px] font-bold",
                  service.requiresDiscovery
                    ? "bg-teal-500/10 text-teal-600 border-teal-500/20"
                    : "bg-muted text-muted-foreground border-border/30",
                )}
              >
                {service.requiresDiscovery ? "Discovery wajib" : "Budget gate"}
              </span>
              <span
                className={cn(
                  "rounded border px-2 py-0.5 text-[10px] font-bold",
                  service.isActive
                    ? "bg-success/10 text-success border-success/20"
                    : "bg-destructive/10 text-destructive border-destructive/20",
                )}
              >
                {service.isActive ? "Aktif" : "Nonaktif"}
              </span>
            </div>
          </div>
        ))}

        {services.data?.length === 0 ? (
          <p className="text-sm text-muted-foreground py-6 text-center col-span-full">
            Belum ada layanan dalam katalog.
          </p>
        ) : null}
      </div>

      {/* Services Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogOverlay />
        <DialogContent className="max-w-xl p-0 overflow-hidden">
          <DialogHeader>
            <DialogTitle>
              {formState.editingService ? "Edit Layanan" : "Rule Kualifikasi Baru"}
            </DialogTitle>
            <DialogDescription>
              Atur budget minimum, kebutuhan discovery, dan status aktif untuk menjaga kualitas lead mitra.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={formState.onSubmit}>
            <DialogBody className="space-y-4">
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="type">Kode Layanan</FieldLabel>
                  <Input
                    id="type"
                    readOnly={Boolean(formState.editingService)}
                    placeholder="Contoh: custom_software"
                    {...register("type")}
                  />
                  <FieldDescription>Contoh `company_profile` atau `other`</FieldDescription>
                  {errors.type ? <FieldError>{errors.type.message}</FieldError> : null}
                </Field>
                <Field>
                  <FieldLabel htmlFor="label">Nama Layanan</FieldLabel>
                  <Input
                    id="label"
                    placeholder="Contoh: Custom Software / ERP"
                    {...register("label")}
                  />
                  {errors.label ? <FieldError>{errors.label.message}</FieldError> : null}
                </Field>
                <Field>
                  <FieldLabel htmlFor="description">Deskripsi</FieldLabel>
                  <Textarea
                    id="description"
                    rows={4}
                    placeholder="Masukkan deskripsi layanan..."
                    {...register("description")}
                  />
                  {errors.description ? <FieldError>{errors.description.message}</FieldError> : null}
                </Field>
                <Field>
                  <FieldLabel htmlFor="minimumBudget">Budget Minimum</FieldLabel>
                  <Input
                    id="minimumBudget"
                    type="number"
                    min={0}
                    {...register("minimumBudget")}
                  />
                  {errors.minimumBudget ? <FieldError>{errors.minimumBudget.message}</FieldError> : null}
                </Field>
              </FieldGroup>

              <div className="grid gap-3 grid-cols-2">
                <label className="flex min-h-12 items-center gap-3 rounded-lg border border-border bg-secondary/50 px-3 text-xs font-bold text-foreground cursor-pointer hover:bg-secondary transition-colors">
                  <input
                    type="checkbox"
                    className="h-4 w-4 accent-primary cursor-pointer"
                    {...register("requiresDiscovery")}
                  />
                  Wajib discovery
                </label>
                <label className="flex min-h-12 items-center gap-3 rounded-lg border border-border bg-secondary/50 px-3 text-xs font-bold text-foreground cursor-pointer hover:bg-secondary transition-colors">
                  <input
                    type="checkbox"
                    className="h-4 w-4 accent-primary cursor-pointer"
                    {...register("isActive")}
                  />
                  Aktif
                </label>
              </div>

              {formState.errorMessage ? (
                <p className="text-sm font-semibold text-destructive">{formState.errorMessage}</p>
              ) : null}
              {deleteAction.errorMessage ? (
                <p className="text-sm font-semibold text-destructive">{deleteAction.errorMessage}</p>
              ) : null}
            </DialogBody>

            <DialogFooter>
              <Button type="button" variant="secondary" onClick={formState.onCancel} className="cursor-pointer">
                Batal
              </Button>
              <Button type="submit" isLoading={formState.isLoading} className="cursor-pointer">
                Simpan Layanan
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
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
