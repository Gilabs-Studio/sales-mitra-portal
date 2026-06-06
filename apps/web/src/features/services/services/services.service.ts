import { apiClient, type ApiEnvelope, unwrapApiResponse } from "@/lib/api-client";
import type { ServiceRule, ServiceRulePayload } from "../types/service.types";

export async function getPublicServiceCatalog() {
  const response = await apiClient.get<ApiEnvelope<ServiceRule[]>>("/catalog/services");
  return unwrapApiResponse(response.data);
}

export async function listAdminServices() {
  const response = await apiClient.get<ApiEnvelope<ServiceRule[]>>("/admin/services");
  return unwrapApiResponse(response.data);
}

export async function upsertService(payload: ServiceRulePayload) {
  const response = await apiClient.post<ApiEnvelope<ServiceRule>>("/admin/services", payload);
  return unwrapApiResponse(response.data);
}

export async function updateService(type: string, payload: ServiceRulePayload) {
  const response = await apiClient.patch<ApiEnvelope<ServiceRule>>(`/admin/services/${type}`, payload);
  return unwrapApiResponse(response.data);
}

export async function deleteService(type: string) {
  const response = await apiClient.delete<ApiEnvelope<Record<string, string>>>(`/admin/services/${type}`);
  return unwrapApiResponse(response.data);
}
