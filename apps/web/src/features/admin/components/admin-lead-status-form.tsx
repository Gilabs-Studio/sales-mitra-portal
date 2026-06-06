"use client";

import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useUpdateLeadStatus } from "@/features/leads/hooks/use-leads";
import type { LeadWithPartner } from "@/features/leads/types/lead.types";
import { statusLabels } from "@/features/leads/utils/lead-labels";

const statuses = ["submitted", "qualified", "contacted", "won", "lost", "rejected"] as const;

export function AdminLeadStatusForm({ lead }: { lead: LeadWithPartner }) {
  const { form, isLoading, errorMessage, onSubmit } = useUpdateLeadStatus(lead);
  const { register } = form;

  return (
    <form onSubmit={onSubmit} className="flex min-w-72 flex-col gap-2">
      <div className="grid grid-cols-[130px_1fr] gap-2">
        <Select aria-label="Status" {...register("status")}>
          {statuses.map((status) => (
            <option key={status} value={status}>
              {statusLabels[status]}
            </option>
          ))}
        </Select>
        <Input aria-label="Catatan status" placeholder="Catatan" {...register("note")} />
      </div>
      {errorMessage ? <FieldError>{errorMessage}</FieldError> : null}
      <Button type="submit" isLoading={isLoading} variant="secondary" className="w-fit">
        <Save className="h-4 w-4" aria-hidden="true" />
        Simpan
      </Button>
    </form>
  );
}
