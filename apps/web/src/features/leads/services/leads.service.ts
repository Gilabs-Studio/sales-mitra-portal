import { apiClient, unwrapApiResponse, type ApiEnvelope } from "@/lib/api-client";
import type {
  CreateLeadPayload,
  Lead,
  LeadFilters,
  LeadWithPartner,
  ServiceRule,
  UpdateLeadStatusPayload,
} from "../types/lead.types";

export async function getServiceCatalog() {
  const response = await apiClient.get<ApiEnvelope<ServiceRule[]>>("/catalog/services");
  return unwrapApiResponse(response.data);
}

export async function listPartnerLeads(filters: LeadFilters = {}) {
  const response = await apiClient.get<ApiEnvelope<Lead[]>>("/partner/leads", {
    params: filters,
  });
  return unwrapApiResponse(response.data);
}

export async function createLead(payload: CreateLeadPayload) {
  const response = await apiClient.post<ApiEnvelope<Lead>>("/partner/leads", payload);
  return unwrapApiResponse(response.data);
}

export async function listAdminLeads(filters: LeadFilters = {}) {
  const response = await apiClient.get<ApiEnvelope<LeadWithPartner[]>>("/admin/leads", {
    params: filters,
  });
  return unwrapApiResponse(response.data);
}

export async function updateLeadStatus(id: string, payload: UpdateLeadStatusPayload) {
  const response = await apiClient.patch<ApiEnvelope<LeadWithPartner>>(`/admin/leads/${id}/status`, payload);
  return unwrapApiResponse(response.data);
}
