import type { Role } from "@/features/auth/types/auth.types";
import type {
  InvoiceStatus,
  MaintenanceLog,
  ProgressStatus,
  Project,
  ProjectDocument,
  ProjectInvoice,
  ProjectMaintenance,
  ProjectProgress,
  ProjectStatus,
} from "@/features/client/types/client.types";

export type CreateAdminPayload = {
  name: string;
  username: string;
  email: string;
  password: string;
};

export type UpdateUserSuspensionPayload = {
  isSuspended: boolean;
  reason: string;
};

export type AdminUser = {
  id: string;
  name: string;
  username: string;
  email: string;
  role: Role;
  partnerCode: string;
  isSuspended: boolean;
  suspendedReason: string;
  createdAt: string;
};

export type PartnerWithStats = {
  id: string;
  name: string;
  username: string;
  email: string;
  role: Role;
  partnerCode: string;
  isSuspended: boolean;
  suspendedReason: string;
  createdAt: string;
  totalLeads: number;
  qualifiedLeads: number;
  wonLeads: number;
  rejectedLeads: number;
};

export type PartnerFilters = {
  page?: number;
  pageSize?: number;
};

export type PaginatedPartners = {
  data: PartnerWithStats[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export type AdminClient = {
  id: string;
  name: string;
  email: string;
  isSuspended: boolean;
  createdAt: string;
};

export type ListClientsParams = {
  page?: number;
  pageSize?: number;
};

export type PaginatedClients = {
  data: AdminClient[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export type CreateClientPayload = {
  name: string;
  email: string;
  password?: string;
};

export type ClientDetailResponse = {
  client: AdminClient;
  projects: Project[];
};

export type CreateProjectPayload = {
  clientId: string;
  name: string;
  description: string;
  picName: string;
  picContact: string;
  startDate: string;
  targetEndDate: string;
  status: ProjectStatus;
  websiteUrl: string;
  stagingUrl: string;
  credentials: string;
  documentation: string;
};

export type UpdateProjectPayload = Omit<CreateProjectPayload, "clientId">;

export type ProjectDetailResponse = {
  project?: Project;
  progress?: ProjectProgress[];
  documents?: ProjectDocument[];
  maintenance?: ProjectMaintenance[];
  maintLogs?: AdminMaintenanceLog[];
  invoices?: ProjectInvoice[];
};

export type CreateProjectProgressPayload = {
  title: string;
  status: ProgressStatus;
  percentage: number;
  notes: string;
  documentUrl?: string;
};

export type UpdateProjectProgressPayload = CreateProjectProgressPayload;

export type CreateProjectDocumentPayload = {
  title: string;
  documentUrl: string;
};

export type CreateProjectMaintenancePayload = {
  packageName: string;
  startDate: string;
  endDate: string;
  quotaLimit: number;
  quotaUsed: number;
};

export type UpdateProjectMaintenancePayload = CreateProjectMaintenancePayload;

export type AdminMaintenanceLog = MaintenanceLog & {
  maintenanceId?: string;
  projectName?: string;
};

export type CreateMaintenanceLogPayload = {
  description: string;
  status: ProgressStatus;
  picName: string;
  maintenanceId: string;
  requestDate: string;
};

export type CreateProjectInvoicePayload = {
  invoiceNumber: string;
  amount: number;
  status: InvoiceStatus;
  issueDate: string;
  dueDate: string;
  documentUrl: string;
};

export type UpdateProjectInvoicePayload = {
  status: InvoiceStatus;
};

export type UpdateMaintenanceLogStatusPayload = {
  status: ProgressStatus;
};
