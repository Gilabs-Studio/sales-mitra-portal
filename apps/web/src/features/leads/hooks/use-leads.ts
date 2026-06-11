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
import {
  createLead,
  getAdminLead,
  getLeadEvents,
  getPartnerLead,
  listAdminLeads,
  listLeadMessages,
  listPartnerLeads,
  sendLeadMessage,
  updateLeadStatus,
  getLeadPayouts,
  createLeadPayout,
  updateLeadCommission,
} from "../services/leads.service";
import type { LeadFilters, LeadStatus, LeadWithPartner } from "../types/lead.types";
import { useLeadFilterStore } from "../stores/use-lead-filter-store";

const PAGE_SIZE = 15;

export function useLeadFilters() {
  const status = useLeadFilterStore((state) => state.status);
  const serviceType = useLeadFilterStore((state) => state.serviceType);
  const page = useLeadFilterStore((state) => state.page);
  const setStatus = useLeadFilterStore((state) => state.setStatus);
  const setServiceType = useLeadFilterStore((state) => state.setServiceType);
  const setPage = useLeadFilterStore((state) => state.setPage);

  return { status, serviceType, page, setStatus, setServiceType, setPage };
}

export function usePartnerLeads() {
  const { status, serviceType, page } = useLeadFilters();
  const filters: LeadFilters = { status, serviceType, page, pageSize: PAGE_SIZE };
  return useQuery({
    queryKey: ["partner", "leads", filters],
    queryFn: () => listPartnerLeads(filters),
  });
}

export function useAdminLeads() {
  const { status, serviceType, page } = useLeadFilters();
  const filters: LeadFilters = { status, serviceType, page, pageSize: PAGE_SIZE };
  return useQuery({
    queryKey: ["admin", "leads", filters],
    queryFn: () => listAdminLeads(filters),
  });
}

export function useUnreadCount(role?: "partner" | "admin") {
  return useQuery({
    queryKey: [role ?? "none", "leads", "unread-total"],
    queryFn: () => role === "admin" ? listAdminLeads({ page: 1, pageSize: 100 }) : listPartnerLeads({ page: 1, pageSize: 100 }),
    enabled: role === "admin" || role === "partner",
  });
}

export function usePartnerLeadDetail(id: string) {
  return useQuery({
    queryKey: ["partner", "leads", id],
    queryFn: () => getPartnerLead(id),
    enabled: !!id,
  });
}

export function useAdminLeadDetail(id: string) {
  return useQuery({
    queryKey: ["admin", "leads", id],
    queryFn: () => getAdminLead(id),
    enabled: !!id,
  });
}

export function useLeadEvents(leadId: string, role: "partner" | "admin") {
  return useQuery({
    queryKey: [role, "leads", leadId, "events"],
    queryFn: () => getLeadEvents(leadId, role),
    enabled: !!leadId,
  });
}

export function useLeadMessages(leadId: string, role: "partner" | "admin", limit = 15) {
  return useQuery({
    queryKey: [role, "leads", leadId, "messages", limit],
    queryFn: () => listLeadMessages(leadId, role, { limit, offset: 0 }),
    enabled: !!leadId,
    // No polling — real-time updates come via WebSocket (use-lead-ws.ts)
  });
}

export function useSendMessage(leadId: string, role: "partner" | "admin") {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (message: string) => sendLeadMessage(leadId, role, message),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [role, "leads", leadId, "messages"] });
    },
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
    successMessage: mutation.isSuccess ? "Lead berhasil dikirim dan otomatis masuk pipeline kualifikasi" : "",
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

export function useLeadPayouts(leadId: string, role: "partner" | "admin") {
  return useQuery({
    queryKey: [role, "leads", leadId, "payouts"],
    queryFn: () => getLeadPayouts(leadId, role),
    enabled: !!leadId,
  });
}

export function useCreatePayout(leadId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (values: { amountPaid: number; evidence: File }) =>
      createLeadPayout(leadId, values.amountPaid, values.evidence),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin", "leads", leadId, "payouts"] });
      void queryClient.invalidateQueries({ queryKey: ["partner", "leads", leadId, "payouts"] });
      void queryClient.invalidateQueries({ queryKey: ["admin", "leads", leadId] });
      void queryClient.invalidateQueries({ queryKey: ["partner", "leads", leadId] });
    },
  });
}

export function useUpdateLeadCommission(leadId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (values: { dealAmount: number; commissionRate: number }) =>
      updateLeadCommission(leadId, values),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin", "leads", leadId, "payouts"] });
      void queryClient.invalidateQueries({ queryKey: ["partner", "leads", leadId, "payouts"] });
      void queryClient.invalidateQueries({ queryKey: ["admin", "leads", leadId] });
      void queryClient.invalidateQueries({ queryKey: ["partner", "leads", leadId] });
      void queryClient.invalidateQueries({ queryKey: ["admin", "leads"] });
      void queryClient.invalidateQueries({ queryKey: ["partner", "leads"] });
    },
  });
}
