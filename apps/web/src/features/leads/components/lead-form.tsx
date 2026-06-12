"use client";

import { Send } from "lucide-react";
import { Controller } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { NumericInput } from "@/components/ui/numeric-input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useServiceCatalog } from "@/features/services/hooks/use-services";
import { useCreateLeadForm } from "../hooks/use-leads";
import { formatCurrency } from "@/lib/utils";
import { useToastStore } from "@/features/dashboard/stores/use-toast-store";

type LeadFormProps = {
  onSuccess?: () => void;
  onCancel?: () => void;
};

export function LeadForm({ onSuccess, onCancel }: LeadFormProps) {
  const services = useServiceCatalog();
  const addToast = useToastStore((state) => state.addToast);
  const { form, isLoading, errorMessage, onSubmit } = useCreateLeadForm({
    onSuccess: () => {
      addToast("Lead berhasil dikirim dan otomatis masuk pipeline kualifikasi", "success");
      onSuccess?.();
    },
  });
  const {
    register,
    watch,
    control,
    formState: { errors },
  } = form;
  const selectedService = services.data?.find((service) => service.type === watch("serviceType"));

  return (
    <form onSubmit={onSubmit} className="space-y-5 p-6">
      <div>
        <h2 className="text-xl font-extrabold text-foreground">Submit lead baru</h2>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">
          Sistem otomatis memberi status kualifikasi berdasarkan tipe layanan dan budget
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
            <Select id="serviceType" {...register("serviceType")} className="cursor-pointer">
              {services.data?.map((service) => (
                <option key={service.type} value={service.type}>
                  {service.label}
                </option>
              ))}
            </Select>
            {selectedService ? (
              <FieldDescription>
                Minimal {selectedService.minimumBudget > 0 ? formatCurrency(selectedService.minimumBudget) : "tanpa minimum"}
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
          <Controller
            name="budget"
            control={control}
            render={({ field }) => (
              <NumericInput
                id="budget"
                min={0}
                placeholder="0"
                value={field.value as number}
                onChange={field.onChange}
                onBlur={field.onBlur}
              />
            )}
          />
          {errors.budget ? <FieldError>{errors.budget.message}</FieldError> : null}
        </Field>
        <Field>
          <FieldLabel htmlFor="needSummary">Ringkasan kebutuhan</FieldLabel>
          <Textarea id="needSummary" {...register("needSummary")} />
          <FieldDescription>Wajib detail untuk layanan discovery jika budget belum diketahui</FieldDescription>
          {errors.needSummary ? <FieldError>{errors.needSummary.message}</FieldError> : null}
        </Field>
        <Field>
          <FieldLabel htmlFor="notes">Catatan tambahan</FieldLabel>
          <Textarea id="notes" {...register("notes")} />
        </Field>
      </FieldGroup>
      {errorMessage ? <FieldError>{errorMessage}</FieldError> : null}
      <div className="flex justify-end gap-2 pt-2">
        {onCancel ? (
          <Button type="button" variant="secondary" onClick={onCancel} className="cursor-pointer">
            Batal
          </Button>
        ) : null}
        <Button type="submit" isLoading={isLoading} className="cursor-pointer">
          <Send className="h-4 w-4" aria-hidden="true" />
          Kirim lead
        </Button>
      </div>
    </form>
  );
}
