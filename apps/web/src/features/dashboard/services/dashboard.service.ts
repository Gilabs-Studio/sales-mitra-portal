import { apiClient, unwrapApiResponse, type ApiEnvelope } from "@/lib/api-client";
import type { AdminDashboard, PartnerDashboard } from "../types/dashboard.types";

export async function getPartnerDashboard() {
  const response = await apiClient.get<ApiEnvelope<PartnerDashboard>>("/partner/dashboard");
  return unwrapApiResponse(response.data);
}

export async function getAdminDashboard() {
  const response = await apiClient.get<ApiEnvelope<AdminDashboard>>("/admin/dashboard");
  return unwrapApiResponse(response.data);
}
