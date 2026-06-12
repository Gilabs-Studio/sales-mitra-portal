import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ProgressStatus } from "@/features/client/types/client.types";
import type {
  CreateMaintenanceLogPayload,
  CreateProjectDocumentPayload,
  CreateProjectInvoicePayload,
  CreateProjectMaintenancePayload,
  CreateProjectProgressPayload,
  UpdateProjectInvoicePayload,
  UpdateProjectMaintenancePayload,
  UpdateProjectPayload,
  UpdateProjectProgressPayload,
} from "../types/admin.types";
import {
  listClients,
  createClient,
  getClientDetail,
  deleteClient,
  resetClientPassword,
  listProjects,
  createProject,
  getProjectDetail,
  updateProject,
  deleteProject,
  createProjectProgress,
  deleteProjectProgress,
  createProjectDocument,
  deleteProjectDocument,
  createOrUpdateProjectMaintenance,
  createProjectMaintenance,
  updateProjectMaintenance,
  deleteProjectMaintenance,
  createMaintenanceLog,
  deleteMaintenanceLog,
  createProjectInvoice,
  updateProjectInvoice,
  deleteProjectInvoice,
  updateProjectProgress,
  updateUserSuspension,
  getAllMaintenanceLogs,
  updateMaintenanceLogStatus,
} from "../services/admin.service";

export function useAdminClients(params: { page?: number; pageSize?: number } = {}) {
  return useQuery({
    queryKey: ["admin", "clients", params],
    queryFn: () => listClients(params),
  });
}

export function useCreateClient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createClient,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin", "clients"] });
    },
  });
}

export function useClientDetail(id: string) {
  return useQuery({
    queryKey: ["admin", "clients", id],
    queryFn: () => getClientDetail(id),
    enabled: !!id,
  });
}

export function useDeleteClient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteClient,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin", "clients"] });
    },
  });
}

export function useResetClientPassword() {
  return useMutation({
    mutationFn: resetClientPassword,
  });
}

export function useAdminProjects() {
  return useQuery({
    queryKey: ["admin", "projects"],
    queryFn: listProjects,
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createProject,
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: ["admin", "projects"] });
      if (variables.clientId) {
        void queryClient.invalidateQueries({ queryKey: ["admin", "clients", variables.clientId] });
      }
    },
  });
}

export function useProjectDetail(id: string) {
  return useQuery({
    queryKey: ["admin", "projects", id],
    queryFn: () => getProjectDetail(id),
    enabled: !!id,
  });
}

export function useUpdateProject(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateProjectPayload) => updateProject(projectId, payload),
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: ["admin", "projects", projectId] });
      void queryClient.invalidateQueries({ queryKey: ["admin", "projects"] });
      if (data?.clientId) {
        void queryClient.invalidateQueries({ queryKey: ["admin", "clients", data.clientId] });
      }
    },
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteProject,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin", "projects"] });
      void queryClient.invalidateQueries({ queryKey: ["admin", "clients"] });
    },
  });
}

// Project Milestones
export function useCreateProjectProgress(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateProjectProgressPayload) => createProjectProgress(projectId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin", "projects", projectId] });
      void queryClient.invalidateQueries({ queryKey: ["client", "projects", projectId] });
      void queryClient.invalidateQueries({ queryKey: ["client", "dashboard"] });
    },
  });
}

export function useDeleteProjectProgress(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (progressId: string) => deleteProjectProgress(projectId, progressId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin", "projects", projectId] });
      void queryClient.invalidateQueries({ queryKey: ["client", "projects", projectId] });
      void queryClient.invalidateQueries({ queryKey: ["client", "dashboard"] });
    },
  });
}

export function useUpdateProjectProgress(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ progressId, payload }: { progressId: string; payload: UpdateProjectProgressPayload }) =>
      updateProjectProgress(projectId, progressId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin", "projects", projectId] });
      void queryClient.invalidateQueries({ queryKey: ["client", "projects", projectId] });
      void queryClient.invalidateQueries({ queryKey: ["client", "dashboard"] });
    },
  });
}

// Project Documents
export function useCreateProjectDocument(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateProjectDocumentPayload) => createProjectDocument(projectId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin", "projects", projectId] });
      void queryClient.invalidateQueries({ queryKey: ["client", "projects", projectId, "documents"] });
      void queryClient.invalidateQueries({ queryKey: ["client", "projects", projectId] });
    },
  });
}

export function useDeleteProjectDocument(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (docId: string) => deleteProjectDocument(projectId, docId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin", "projects", projectId] });
      void queryClient.invalidateQueries({ queryKey: ["client", "projects", projectId, "documents"] });
      void queryClient.invalidateQueries({ queryKey: ["client", "projects", projectId] });
    },
  });
}

// Project Maintenance
export function useCreateOrUpdateMaintenance(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateProjectMaintenancePayload) => createOrUpdateProjectMaintenance(projectId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin", "projects", projectId] });
      void queryClient.invalidateQueries({ queryKey: ["client", "projects", projectId, "maintenance"] });
      void queryClient.invalidateQueries({ queryKey: ["client", "projects", projectId] });
      void queryClient.invalidateQueries({ queryKey: ["client", "dashboard"] });
    },
  });
}

export function useCreateMaintenanceLog(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateMaintenanceLogPayload) => createMaintenanceLog(projectId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin", "projects", projectId] });
      void queryClient.invalidateQueries({ queryKey: ["client", "projects", projectId, "maintenance-logs"] });
      void queryClient.invalidateQueries({ queryKey: ["client", "projects", projectId, "maintenance"] });
      void queryClient.invalidateQueries({ queryKey: ["client", "dashboard"] });
    },
  });
}

export function useDeleteMaintenanceLog(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (logId: string) => deleteMaintenanceLog(projectId, logId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin", "projects", projectId] });
      void queryClient.invalidateQueries({ queryKey: ["client", "projects", projectId, "maintenance-logs"] });
      void queryClient.invalidateQueries({ queryKey: ["client", "projects", projectId, "maintenance"] });
      void queryClient.invalidateQueries({ queryKey: ["client", "dashboard"] });
    },
  });
}

// Project Invoices
export function useCreateProjectInvoice(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateProjectInvoicePayload) => createProjectInvoice(projectId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin", "projects", projectId] });
      void queryClient.invalidateQueries({ queryKey: ["client", "projects", projectId, "invoices"] });
      void queryClient.invalidateQueries({ queryKey: ["client", "projects", projectId] });
      void queryClient.invalidateQueries({ queryKey: ["client", "dashboard"] });
    },
  });
}

export function useUpdateProjectInvoice(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ invoiceId, payload }: { invoiceId: string; payload: UpdateProjectInvoicePayload }) => updateProjectInvoice(invoiceId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin", "projects", projectId] });
      void queryClient.invalidateQueries({ queryKey: ["client", "projects", projectId, "invoices"] });
      void queryClient.invalidateQueries({ queryKey: ["client", "projects", projectId] });
      void queryClient.invalidateQueries({ queryKey: ["client", "dashboard"] });
    },
  });
}

export function useDeleteProjectInvoice(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (invoiceId: string) => deleteProjectInvoice(invoiceId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin", "projects", projectId] });
      void queryClient.invalidateQueries({ queryKey: ["client", "projects", projectId, "invoices"] });
      void queryClient.invalidateQueries({ queryKey: ["client", "projects", projectId] });
      void queryClient.invalidateQueries({ queryKey: ["client", "dashboard"] });
    },
  });
}

export function useUpdateUserSuspension() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, isSuspended, reason }: { userId: string; isSuspended: boolean; reason: string }) =>
      updateUserSuspension(userId, { isSuspended, reason }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin", "clients"] });
    },
  });
}

export function useCreateProjectMaintenance(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateProjectMaintenancePayload) => createProjectMaintenance(projectId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin", "projects", projectId] });
    },
  });
}

export function useUpdateProjectMaintenance(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ maintId, payload }: { maintId: string; payload: UpdateProjectMaintenancePayload }) =>
      updateProjectMaintenance(projectId, maintId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin", "projects", projectId] });
    },
  });
}

export function useDeleteProjectMaintenance(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (maintId: string) => deleteProjectMaintenance(projectId, maintId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin", "projects", projectId] });
      void queryClient.invalidateQueries({ queryKey: ["client", "projects", projectId, "maintenance"] });
      void queryClient.invalidateQueries({ queryKey: ["client", "dashboard"] });
    },
  });
}

export function useAllMaintenanceLogs() {
  return useQuery({
    queryKey: ["admin", "all-maintenance-logs"],
    queryFn: getAllMaintenanceLogs,
  });
}

export function useUpdateMaintenanceLogStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ logId, status }: { logId: string; status: ProgressStatus }) =>
      updateMaintenanceLogStatus(logId, status),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin", "all-maintenance-logs"] });
      void queryClient.invalidateQueries({ queryKey: ["admin", "projects"] });
      void queryClient.invalidateQueries({ queryKey: ["client", "dashboard"] });
    },
  });
}
