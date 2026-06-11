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

// Client Management Services
export async function listClients(params: { page?: number; pageSize?: number } = {}) {
  const response = await apiClient.get<ApiEnvelope<any>>("/admin/clients", { params });
  return unwrapApiResponse(response.data);
}

export async function createClient(payload: { name: string; email: string; password?: string }) {
  const response = await apiClient.post<ApiEnvelope<any>>("/admin/clients", payload);
  return unwrapApiResponse(response.data);
}

export async function getClientDetail(id: string) {
  const response = await apiClient.get<ApiEnvelope<any>>(`/admin/clients/${id}`);
  return unwrapApiResponse(response.data);
}

export async function deleteClient(id: string) {
  const response = await apiClient.delete<ApiEnvelope<any>>(`/admin/clients/${id}`);
  return unwrapApiResponse(response.data);
}

export async function resetClientPassword(id: string) {
  const response = await apiClient.post<ApiEnvelope<any>>(`/admin/clients/${id}/reset-password`);
  return unwrapApiResponse(response.data);
}

// Project Management Services
export async function listProjects() {
  const response = await apiClient.get<ApiEnvelope<any[]>>("/admin/projects");
  return unwrapApiResponse(response.data);
}

export async function createProject(payload: any) {
  const response = await apiClient.post<ApiEnvelope<any>>("/admin/projects", payload);
  return unwrapApiResponse(response.data);
}

export async function getProjectDetail(id: string) {
  const response = await apiClient.get<ApiEnvelope<any>>(`/admin/projects/${id}`);
  return unwrapApiResponse(response.data);
}

export async function updateProject(id: string, payload: any) {
  const response = await apiClient.patch<ApiEnvelope<any>>(`/admin/projects/${id}`, payload);
  return unwrapApiResponse(response.data);
}

export async function deleteProject(id: string) {
  const response = await apiClient.delete<ApiEnvelope<any>>(`/admin/projects/${id}`);
  return unwrapApiResponse(response.data);
}

// Project Additions Management
export async function createProjectProgress(projectId: string, payload: any) {
  const response = await apiClient.post<ApiEnvelope<any>>(`/admin/projects/${projectId}/progress`, payload);
  return unwrapApiResponse(response.data);
}

export async function deleteProjectProgress(projectId: string, progressId: string) {
  const response = await apiClient.delete<ApiEnvelope<any>>(`/admin/projects/${projectId}/progress/${progressId}`);
  return unwrapApiResponse(response.data);
}

export async function createProjectDocument(projectId: string, payload: any) {
  const response = await apiClient.post<ApiEnvelope<any>>(`/admin/projects/${projectId}/documents`, payload);
  return unwrapApiResponse(response.data);
}

export async function deleteProjectDocument(projectId: string, docId: string) {
  const response = await apiClient.delete<ApiEnvelope<any>>(`/admin/projects/${projectId}/documents/${docId}`);
  return unwrapApiResponse(response.data);
}

export async function createOrUpdateProjectMaintenance(projectId: string, payload: any) {
  const response = await apiClient.post<ApiEnvelope<any>>(`/admin/projects/${projectId}/maintenance`, payload);
  return unwrapApiResponse(response.data);
}

export async function createProjectMaintenance(projectId: string, payload: any) {
  const response = await apiClient.post<ApiEnvelope<any>>(`/admin/projects/${projectId}/maintenance`, payload);
  return unwrapApiResponse(response.data);
}

export async function updateProjectMaintenance(projectId: string, maintId: string, payload: any) {
  const response = await apiClient.patch<ApiEnvelope<any>>(`/admin/projects/${projectId}/maintenance/${maintId}`, payload);
  return unwrapApiResponse(response.data);
}

export async function deleteProjectMaintenance(projectId: string, maintId: string) {
  const response = await apiClient.delete<ApiEnvelope<any>>(`/admin/projects/${projectId}/maintenance/${maintId}`);
  return unwrapApiResponse(response.data);
}

export async function createMaintenanceLog(projectId: string, payload: any) {
  const response = await apiClient.post<ApiEnvelope<any>>(`/admin/projects/${projectId}/maintenance-logs`, payload);
  return unwrapApiResponse(response.data);
}

export async function deleteMaintenanceLog(projectId: string, logId: string) {
  const response = await apiClient.delete<ApiEnvelope<any>>(`/admin/projects/${projectId}/maintenance-logs/${logId}`);
  return unwrapApiResponse(response.data);
}

export async function createProjectInvoice(projectId: string, payload: any) {
  const response = await apiClient.post<ApiEnvelope<any>>(`/admin/projects/${projectId}/invoices`, payload);
  return unwrapApiResponse(response.data);
}

export async function updateProjectInvoice(invoiceId: string, payload: any) {
  const response = await apiClient.patch<ApiEnvelope<any>>(`/admin/projects/any/invoices/${invoiceId}`, payload);
  return unwrapApiResponse(response.data);
}

export async function deleteProjectInvoice(invoiceId: string) {
  const response = await apiClient.delete<ApiEnvelope<any>>(`/admin/projects/any/invoices/${invoiceId}`);
  return unwrapApiResponse(response.data);
}

export async function uploadFile(file: File) {
  const formData = new FormData();
  formData.append("file", file);
  const response = await apiClient.post<ApiEnvelope<{ url: string }>>("/admin/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return unwrapApiResponse(response.data);
}

export async function updateProjectProgress(projectId: string, progressId: string, payload: any) {
  const response = await apiClient.patch<ApiEnvelope<any>>(`/admin/projects/${projectId}/progress/${progressId}`, payload);
  return unwrapApiResponse(response.data);
}

export async function getAllMaintenanceLogs() {
  const response = await apiClient.get<ApiEnvelope<any[]>>("/admin/maintenance-logs");
  return unwrapApiResponse(response.data);
}

export async function updateMaintenanceLogStatus(logId: string, status: string) {
  const response = await apiClient.patch<ApiEnvelope<any>>(`/admin/maintenance-logs/${logId}/status`, { status });
  return unwrapApiResponse(response.data);
}
