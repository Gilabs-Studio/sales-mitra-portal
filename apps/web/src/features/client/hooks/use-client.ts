import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getClientDashboard,
  getClientProject,
  getProjectDocuments,
  getProjectInvoices,
  getProjectMaintenance,
  getProjectMaintenanceLogs,
  getProjectProgress,
  getProjectReportData,
  listClientProjects,
  updateClientProfile,
} from "../services/client.service";

export function useClientDashboard() {
  return useQuery({
    queryKey: ["client", "dashboard"],
    queryFn: getClientDashboard,
  });
}

export function useClientProjects() {
  return useQuery({
    queryKey: ["client", "projects"],
    queryFn: listClientProjects,
  });
}

export function useClientProjectDetail(id: string) {
  return useQuery({
    queryKey: ["client", "projects", id],
    queryFn: () => getClientProject(id),
    enabled: !!id,
  });
}

export function useProjectProgress(projectId: string) {
  return useQuery({
    queryKey: ["client", "projects", projectId, "progress"],
    queryFn: () => getProjectProgress(projectId),
    enabled: !!projectId,
  });
}

export function useProjectMaintenance(projectId: string) {
  return useQuery({
    queryKey: ["client", "projects", projectId, "maintenance"],
    queryFn: () => getProjectMaintenance(projectId),
    enabled: !!projectId,
    retry: false, // Might not have maintenance package
  });
}

export function useProjectMaintenanceLogs(projectId: string) {
  return useQuery({
    queryKey: ["client", "projects", projectId, "maintenance-logs"],
    queryFn: () => getProjectMaintenanceLogs(projectId),
    enabled: !!projectId,
  });
}

export function useProjectInvoices(projectId: string) {
  return useQuery({
    queryKey: ["client", "projects", projectId, "invoices"],
    queryFn: () => getProjectInvoices(projectId),
    enabled: !!projectId,
  });
}

export function useProjectDocuments(projectId: string) {
  return useQuery({
    queryKey: ["client", "projects", projectId, "documents"],
    queryFn: () => getProjectDocuments(projectId),
    enabled: !!projectId,
  });
}

export function useProjectReportData(projectId: string) {
  return useQuery({
    queryKey: ["client", "projects", projectId, "reports"],
    queryFn: () => getProjectReportData(projectId),
    enabled: !!projectId,
  });
}

export function useUpdateClientProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateClientProfile,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
      void queryClient.invalidateQueries({ queryKey: ["client", "dashboard"] });
    },
  });
}
