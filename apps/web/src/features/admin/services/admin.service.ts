import { apiClient, unwrapApiResponse, type ApiEnvelope } from "@/lib/api-client";
import type {
  AdminClient,
  AdminMaintenanceLog,
  AdminUser,
  ClientDetailResponse,
  CreateClientPayload,
  CreateAdminPayload,
  CreateMaintenanceLogPayload,
  CreateProjectDocumentPayload,
  CreateProjectInvoicePayload,
  CreateProjectMaintenancePayload,
  CreateProjectPayload,
  CreateProjectProgressPayload,
  ListClientsParams,
  PaginatedClients,
  UpdateUserSuspensionPayload,
  UpdateMaintenanceLogStatusPayload,
  UpdateProjectInvoicePayload,
  UpdateProjectMaintenancePayload,
  UpdateProjectPayload,
  UpdateProjectProgressPayload,
  PartnerFilters,
  PaginatedPartners,
  ProjectDetailResponse,
} from "../types/admin.types";
import type { Project, ProjectDocument, ProjectInvoice, ProjectMaintenance, ProjectProgress } from "@/features/client/types/client.types";

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
export async function listClients(params: ListClientsParams = {}) {
  const response = await apiClient.get<ApiEnvelope<PaginatedClients>>("/admin/clients", { params });
  return unwrapApiResponse(response.data);
}

export async function createClient(payload: CreateClientPayload) {
  const response = await apiClient.post<ApiEnvelope<AdminClient>>("/admin/clients", payload);
  return unwrapApiResponse(response.data);
}

export async function getClientDetail(id: string) {
  const response = await apiClient.get<ApiEnvelope<ClientDetailResponse>>(`/admin/clients/${id}`);
  return unwrapApiResponse(response.data);
}

export async function deleteClient(id: string) {
  const response = await apiClient.delete<ApiEnvelope<Record<string, never>>>(`/admin/clients/${id}`);
  return unwrapApiResponse(response.data);
}

export async function resetClientPassword(id: string) {
  const response = await apiClient.post<ApiEnvelope<Record<string, never>>>(`/admin/clients/${id}/reset-password`);
  return unwrapApiResponse(response.data);
}

// Project Management Services
export async function listProjects() {
  const response = await apiClient.get<ApiEnvelope<Project[]>>("/admin/projects");
  return unwrapApiResponse(response.data);
}

export async function createProject(payload: CreateProjectPayload) {
  const response = await apiClient.post<ApiEnvelope<Project>>("/admin/projects", payload);
  return unwrapApiResponse(response.data);
}

export async function getProjectDetail(id: string) {
  const response = await apiClient.get<ApiEnvelope<ProjectDetailResponse>>(`/admin/projects/${id}`);
  return unwrapApiResponse(response.data);
}

export async function updateProject(id: string, payload: UpdateProjectPayload) {
  const response = await apiClient.patch<ApiEnvelope<Project>>(`/admin/projects/${id}`, payload);
  return unwrapApiResponse(response.data);
}

export async function deleteProject(id: string) {
  const response = await apiClient.delete<ApiEnvelope<Record<string, never>>>(`/admin/projects/${id}`);
  return unwrapApiResponse(response.data);
}

// Project Additions Management
export async function createProjectProgress(projectId: string, payload: CreateProjectProgressPayload) {
  const response = await apiClient.post<ApiEnvelope<ProjectProgress>>(`/admin/projects/${projectId}/progress`, payload);
  return unwrapApiResponse(response.data);
}

export async function deleteProjectProgress(projectId: string, progressId: string) {
  const response = await apiClient.delete<ApiEnvelope<Record<string, never>>>(`/admin/projects/${projectId}/progress/${progressId}`);
  return unwrapApiResponse(response.data);
}

export async function createProjectDocument(projectId: string, payload: CreateProjectDocumentPayload) {
  const response = await apiClient.post<ApiEnvelope<ProjectDocument>>(`/admin/projects/${projectId}/documents`, payload);
  return unwrapApiResponse(response.data);
}

export async function deleteProjectDocument(projectId: string, docId: string) {
  const response = await apiClient.delete<ApiEnvelope<Record<string, never>>>(`/admin/projects/${projectId}/documents/${docId}`);
  return unwrapApiResponse(response.data);
}

export async function createOrUpdateProjectMaintenance(projectId: string, payload: CreateProjectMaintenancePayload) {
  const response = await apiClient.post<ApiEnvelope<ProjectMaintenance>>(`/admin/projects/${projectId}/maintenance`, payload);
  return unwrapApiResponse(response.data);
}

export async function createProjectMaintenance(projectId: string, payload: CreateProjectMaintenancePayload) {
  const response = await apiClient.post<ApiEnvelope<ProjectMaintenance>>(`/admin/projects/${projectId}/maintenance`, payload);
  return unwrapApiResponse(response.data);
}

export async function updateProjectMaintenance(projectId: string, maintId: string, payload: UpdateProjectMaintenancePayload) {
  const response = await apiClient.patch<ApiEnvelope<ProjectMaintenance>>(`/admin/projects/${projectId}/maintenance/${maintId}`, payload);
  return unwrapApiResponse(response.data);
}

export async function deleteProjectMaintenance(projectId: string, maintId: string) {
  const response = await apiClient.delete<ApiEnvelope<Record<string, never>>>(`/admin/projects/${projectId}/maintenance/${maintId}`);
  return unwrapApiResponse(response.data);
}

export async function createMaintenanceLog(projectId: string, payload: CreateMaintenanceLogPayload) {
  const response = await apiClient.post<ApiEnvelope<AdminMaintenanceLog>>(`/admin/projects/${projectId}/maintenance-logs`, payload);
  return unwrapApiResponse(response.data);
}

export async function deleteMaintenanceLog(projectId: string, logId: string) {
  const response = await apiClient.delete<ApiEnvelope<Record<string, never>>>(`/admin/projects/${projectId}/maintenance-logs/${logId}`);
  return unwrapApiResponse(response.data);
}

export async function createProjectInvoice(projectId: string, payload: CreateProjectInvoicePayload) {
  const response = await apiClient.post<ApiEnvelope<ProjectInvoice>>(`/admin/projects/${projectId}/invoices`, payload);
  return unwrapApiResponse(response.data);
}

export async function updateProjectInvoice(invoiceId: string, payload: UpdateProjectInvoicePayload) {
  const response = await apiClient.patch<ApiEnvelope<ProjectInvoice>>(`/admin/projects/any/invoices/${invoiceId}`, payload);
  return unwrapApiResponse(response.data);
}

export async function deleteProjectInvoice(invoiceId: string) {
  const response = await apiClient.delete<ApiEnvelope<Record<string, never>>>(`/admin/projects/any/invoices/${invoiceId}`);
  return unwrapApiResponse(response.data);
}

type UploadFileContext = {
  category?: string;
  clientId?: string;
  projectId?: string;
};

export async function uploadFile(file: File, context: UploadFileContext = {}) {
  const formData = new FormData();
  formData.append("file", file);
  if (context.category) {
    formData.append("category", context.category);
  }
  if (context.clientId) {
    formData.append("clientId", context.clientId);
  }
  if (context.projectId) {
    formData.append("projectId", context.projectId);
  }
  const response = await apiClient.post<ApiEnvelope<{ url: string }>>("/admin/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return unwrapApiResponse(response.data);
}

export async function updateProjectProgress(projectId: string, progressId: string, payload: UpdateProjectProgressPayload) {
  const response = await apiClient.patch<ApiEnvelope<ProjectProgress>>(`/admin/projects/${projectId}/progress/${progressId}`, payload);
  return unwrapApiResponse(response.data);
}

export async function getAllMaintenanceLogs() {
  const response = await apiClient.get<ApiEnvelope<AdminMaintenanceLog[]>>("/admin/maintenance-logs");
  return unwrapApiResponse(response.data);
}

export async function updateMaintenanceLogStatus(logId: string, status: UpdateMaintenanceLogStatusPayload["status"]) {
  const response = await apiClient.patch<ApiEnvelope<AdminMaintenanceLog>>(`/admin/maintenance-logs/${logId}/status`, { status });
  return unwrapApiResponse(response.data);
}
