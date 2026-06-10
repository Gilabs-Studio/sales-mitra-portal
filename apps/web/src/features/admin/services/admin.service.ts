import { apiClient, unwrapApiResponse, type ApiEnvelope } from "@/lib/api-client";
import type {
  AdminUser,
  CreateAdminPayload,
  PartnerWithStats,
  UpdateUserSuspensionPayload,
  PartnerFilters,
  PaginatedPartners,
} from "../types/admin.types";

export async function listPartners(filters: PartnerFilters = {}) {
  const response = await apiClient.get<ApiEnvelope<PaginatedPartners>>("/admin/partners", {
    params: filters,
  });
  return unwrapApiResponse(response.data);
}

export async function listAdmins() {
  const response = await apiClient.get<ApiEnvelope<AdminUser[]>>("/admin/admins");
  return unwrapApiResponse(response.data);
}

export async function createAdmin(payload: CreateAdminPayload) {
  const response = await apiClient.post<ApiEnvelope<AdminUser>>("/admin/admins", payload);
  return unwrapApiResponse(response.data);
}

export async function updateUserSuspension(userId: string, payload: UpdateUserSuspensionPayload) {
  const response = await apiClient.patch<ApiEnvelope<Record<string, never>>>(`/admin/users/${userId}/suspension`, payload);
  return unwrapApiResponse(response.data);
}
