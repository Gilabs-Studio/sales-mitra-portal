"use client";

import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useCreateLeadForm, useServiceCatalog } from "../hooks/use-leads";
import { formatCurrency } from "@/lib/utils";

export function LeadForm() {
  const services = useServiceCatalog();
  const { form, isLoading, errorMessage, successMessage, onSubmit } = useCreateLeadForm();
  const {
    register,
    watch,
    formState: { errors },
  } = form;
  const selectedService = services.data?.find((service) => service.type === watch("serviceType"));

  return (
    <form onSubmit={onSubmit} className="space-y-5 rounded-lg border border-border bg-card p-5">
      <div>
        <h2 className="text-xl font-extrabold text-foreground">Submit lead baru</h2>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">
          Sistem akan otomatis memberi status kualifikasi berdasarkan tipe layanan dan budget.
        </p>
      </div>
      <FieldGroup>
        <div className="grid gap-4 md:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="companyName">Nama perusahaan</FieldLabel>
            <Input id="companyName" {...register("companyName")} />
            {errors.companyName ? <FieldError>{errors.companyName.message}</FieldError> : null}
          </Field>
          <Field>
            <FieldLabel htmlFor="serviceType">Layanan</FieldLabel>
            <Select id="serviceType" {...register("serviceType")}>
              {services.data?.map((service) => (
                <option key={service.type} value={service.type}>
                  {service.label}
                </option>
              ))}
            </Select>
            {selectedService ? (
              <FieldDescription>
                Minimal {selectedService.minimumBudget > 0 ? formatCurrency(selectedService.minimumBudget) : "tanpa minimum"}.
              </FieldDescription>
            ) : null}
          </Field>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <Field>
            <FieldLabel htmlFor="contactName">Nama kontak</FieldLabel>
            <Input id="contactName" {...register("contactName")} />
            {errors.contactName ? <FieldError>{errors.contactName.message}</FieldError> : null}
          </Field>
          <Field>
            <FieldLabel htmlFor="contactEmail">Email kontak</FieldLabel>
            <Input id="contactEmail" type="email" {...register("contactEmail")} />
            {errors.contactEmail ? <FieldError>{errors.contactEmail.message}</FieldError> : null}
          </Field>
          <Field>
            <FieldLabel htmlFor="contactPhone">Telepon</FieldLabel>
            <Input id="contactPhone" {...register("contactPhone")} />
          </Field>
        </div>
        <Field>
          <FieldLabel htmlFor="budget">Budget</FieldLabel>
          <Input id="budget" type="number" min={0} {...register("budget")} />
          {errors.budget ? <FieldError>{errors.budget.message}</FieldError> : null}
        </Field>
        <Field>
          <FieldLabel htmlFor="needSummary">Ringkasan kebutuhan</FieldLabel>
          <Textarea id="needSummary" {...register("needSummary")} />
          <FieldDescription>Wajib detail untuk Custom Software jika budget belum diketahui.</FieldDescription>
          {errors.needSummary ? <FieldError>{errors.needSummary.message}</FieldError> : null}
        </Field>
        <Field>
          <FieldLabel htmlFor="notes">Catatan tambahan</FieldLabel>
          <Textarea id="notes" {...register("notes")} />
        </Field>
      </FieldGroup>
      {errorMessage ? <FieldError>{errorMessage}</FieldError> : null}
      {successMessage ? <p className="text-sm font-semibold text-success">{successMessage}</p> : null}
      <Button type="submit" isLoading={isLoading}>
        <Send className="h-4 w-4" aria-hidden="true" />
        Kirim lead
      </Button>
    </form>
  );
}
