"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import {
  leadSchema,
  updateLeadStatusSchema,
  type LeadFormInputValues,
  type LeadFormValues,
  type UpdateLeadStatusFormValues,
  type UpdateLeadStatusInputValues,
} from "../schemas/lead.schema";
import { createLead, getServiceCatalog, listAdminLeads, listPartnerLeads, updateLeadStatus } from "../services/leads.service";
import type { LeadFilters, LeadStatus, LeadWithPartner, ServiceType } from "../types/lead.types";
import { useLeadFilterStore } from "../stores/use-lead-filter-store";

export function useServiceCatalog() {
  return useQuery({
    queryKey: ["services"],
    queryFn: getServiceCatalog,
  });
}

export function useLeadFilters() {
  const status = useLeadFilterStore((state) => state.status);
  const serviceType = useLeadFilterStore((state) => state.serviceType);
  const setStatus = useLeadFilterStore((state) => state.setStatus);
  const setServiceType = useLeadFilterStore((state) => state.setServiceType);

  return { status, serviceType, setStatus, setServiceType };
}

export function usePartnerLeads() {
  const { status, serviceType } = useLeadFilters();
  const filters: LeadFilters = { status, serviceType, limit: 50 };
  return useQuery({
    queryKey: ["partner", "leads", filters],
    queryFn: () => listPartnerLeads(filters),
  });
}

export function useAdminLeads() {
  const { status, serviceType } = useLeadFilters();
  const filters: LeadFilters = { status, serviceType, limit: 80 };
  return useQuery({
    queryKey: ["admin", "leads", filters],
    queryFn: () => listAdminLeads(filters),
  });
}

export function useCreateLeadForm() {
  const queryClient = useQueryClient();
  const form = useForm<LeadFormInputValues, unknown, LeadFormValues>({
    resolver: zodResolver(leadSchema),
    defaultValues: {
      companyName: "",
      contactName: "",
      contactEmail: "",
      contactPhone: "",
      serviceType: "company_profile",
      budget: 10000000,
      needSummary: "",
      notes: "",
    },
  });

  const mutation = useMutation({
    mutationFn: createLead,
    onSuccess: () => {
      form.reset();
      void queryClient.invalidateQueries({ queryKey: ["partner"] });
    },
  });

  return {
    form,
    isLoading: mutation.isPending,
    errorMessage: mutation.error instanceof Error ? mutation.error.message : "",
    successMessage: mutation.isSuccess ? "Lead berhasil dikirim dan sudah otomatis dikualifikasi." : "",
    onSubmit: form.handleSubmit((values) => mutation.mutate(values)),
  };
}

export function useUpdateLeadStatus(lead: LeadWithPartner) {
  const queryClient = useQueryClient();
  const form = useForm<UpdateLeadStatusInputValues, unknown, UpdateLeadStatusFormValues>({
    resolver: zodResolver(updateLeadStatusSchema),
    defaultValues: {
      status: lead.status,
      note: lead.notes,
    },
  });

  const mutation = useMutation({
    mutationFn: (values: { status: LeadStatus; note: string }) => updateLeadStatus(lead.id, values),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin"] });
    },
  });

  return {
    form,
    isLoading: mutation.isPending,
    errorMessage: mutation.error instanceof Error ? mutation.error.message : "",
    onSubmit: form.handleSubmit((values) => mutation.mutate(values)),
  };
}

export const statusOptions: Array<LeadStatus | ""> = ["", "submitted", "qualified", "contacted", "won", "lost", "rejected"];
export const serviceOptions: Array<ServiceType | ""> = ["", "company_profile", "website_app", "custom_software", "salesview"];
