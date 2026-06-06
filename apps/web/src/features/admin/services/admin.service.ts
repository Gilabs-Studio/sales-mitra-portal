import { apiClient, unwrapApiResponse, type ApiEnvelope } from "@/lib/api-client";
import type { PartnerWithStats } from "../types/admin.types";

export async function listPartners() {
  const response = await apiClient.get<ApiEnvelope<PartnerWithStats[]>>("/admin/partners");
  return unwrapApiResponse(response.data);
}
