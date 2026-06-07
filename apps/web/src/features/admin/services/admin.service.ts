import { apiClient, unwrapApiResponse, type ApiEnvelope } from "@/lib/api-client";
import type { AdminUser, CreateAdminPayload, PartnerWithStats } from "../types/admin.types";

export async function listPartners() {
  const response = await apiClient.get<ApiEnvelope<PartnerWithStats[]>>("/admin/partners");
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
