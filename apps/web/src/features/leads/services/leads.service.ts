import { apiClient, unwrapApiResponse, type ApiEnvelope } from "@/lib/api-client";
import type {
  CreateLeadPayload,
  Lead,
  LeadEvent,
  LeadFilters,
  LeadMessage,
  LeadWithPartner,
  PaginatedLeads,
  UpdateLeadStatusPayload,
} from "../types/lead.types";

export async function listPartnerLeads(filters: LeadFilters = {}) {
  const response = await apiClient.get<ApiEnvelope<PaginatedLeads<Lead>>>("/partner/leads", {
    params: filters,
  });
  return unwrapApiResponse(response.data);
}

export async function getPartnerLead(id: string) {
  const response = await apiClient.get<ApiEnvelope<Lead>>(`/partner/leads/${id}`);
  return unwrapApiResponse(response.data);
}

export async function createLead(payload: CreateLeadPayload) {
  const response = await apiClient.post<ApiEnvelope<Lead>>("/partner/leads", payload);
  return unwrapApiResponse(response.data);
}

export async function listAdminLeads(filters: LeadFilters = {}) {
  const response = await apiClient.get<ApiEnvelope<PaginatedLeads<LeadWithPartner>>>(
    "/admin/leads",
    { params: filters },
  );
  return unwrapApiResponse(response.data);
}

export async function getAdminLead(id: string) {
  const response = await apiClient.get<ApiEnvelope<LeadWithPartner>>(`/admin/leads/${id}`);
  return unwrapApiResponse(response.data);
}

export async function updateLeadStatus(id: string, payload: UpdateLeadStatusPayload) {
  const response = await apiClient.patch<ApiEnvelope<LeadWithPartner>>(
    `/admin/leads/${id}/status`,
    payload,
  );
  return unwrapApiResponse(response.data);
}

export async function getLeadEvents(leadId: string, role: "partner" | "admin") {
  const base = role === "admin" ? "/admin" : "/partner";
  const response = await apiClient.get<ApiEnvelope<LeadEvent[]>>(
    `${base}/leads/${leadId}/events`,
  );
  return unwrapApiResponse(response.data);
}

export async function listLeadMessages(
  leadId: string,
  role: "partner" | "admin",
  params?: { limit?: number; offset?: number },
) {
  const base = role === "admin" ? "/admin" : "/partner";
  const response = await apiClient.get<ApiEnvelope<LeadMessage[]>>(
    `${base}/leads/${leadId}/messages`,
    { params },
  );
  return unwrapApiResponse(response.data);
}

export async function sendLeadMessage(
  leadId: string,
  role: "partner" | "admin",
  message: string,
) {
  const base = role === "admin" ? "/admin" : "/partner";
  const response = await apiClient.post<ApiEnvelope<LeadMessage>>(
    `${base}/leads/${leadId}/messages`,
    { message },
  );
  return unwrapApiResponse(response.data);
}
