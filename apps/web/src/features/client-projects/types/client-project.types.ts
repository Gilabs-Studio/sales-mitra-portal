import type { User } from "@/features/auth/types/auth.types";

export type ProjectStatus =
  | "discovery"
  | "planning"
  | "development"
  | "testing"
  | "deployment"
  | "completed"
  | "maintenance";

export type ProgressStatus = "todo" | "in_progress" | "blocked" | "done";
export type MaintenanceStatus = "open" | "in_progress" | "resolved" | "rejected";
export type InvoiceStatus = "draft" | "sent" | "waiting_payment" | "paid" | "overdue";
export type DocumentCategory = "deliverable" | "progress" | "maintenance" | "invoice" | "report" | "other";

export type MetricCard = {
  label: string;
  value: number;
};

export type ClientWithStats = User & {
  totalProjects: number;
  activeProjects: number;
  maintenanceProjects: number;
  unpaidInvoices: number;
};

export type PaginatedClients = {
  data: ClientWithStats[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export type ClientProject = {
  id: string;
  clientId: string;
  clientName?: string;
  clientEmail?: string;
  name: string;
  description: string;
  picName: string;
  picEmail: string;
  startDate: string;
  targetEndDate: string;
  status: ProjectStatus;
  progressPercent: number;
  websiteUrl: string;
  stagingUrl: string;
  credentialNote: string;
  documentationUrl: string;
  maintenanceActive: boolean;
  unpaidInvoiceCount: number;
  latestProgressNote: string;
  latestProgressAt: string;
  createdAt: string;
  updatedAt: string;
};

export type ProjectProgress = {
  id: string;
  projectId: string;
  title: string;
  status: ProgressStatus;
  percentage: number;
  note: string;
  documentUrl: string;
  updatedById: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
};

export type ProjectDocument = {
  id: string;
  projectId: string;
  title: string;
  category: DocumentCategory;
  url: string;
  description: string;
  uploadedBy: string;
  createdAt: string;
};

export type MaintenancePlan = {
  id: string;
  projectId: string;
  type: string;
  periodStart: string;
  periodEnd: string;
  quotaTotal: number;
  quotaUsed: number;
  quotaRemaining: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type MaintenanceLog = {
  id: string;
  projectId: string;
  requestDate: string;
  description: string;
  status: MaintenanceStatus;
  picName: string;
  createdAt: string;
  updatedAt: string;
};

export type ProjectInvoice = {
  id: string;
  projectId: string;
  number: string;
  amount: number;
  status: InvoiceStatus;
  issuedAt: string;
  dueAt: string;
  paidAt: string;
  documentUrl: string;
  paymentNote: string;
  createdAt: string;
  updatedAt: string;
};

export type ProjectActivity = {
  id: string;
  projectId: string;
  actorId: string;
  actorName: string;
  action: string;
  description: string;
  createdAt: string;
};

export type ClientDashboard = {
  summary: MetricCard[];
  projects: ClientProject[];
  maintenance: MaintenancePlan[];
  unpaidInvoices: ProjectInvoice[];
  notifications: ProjectActivity[];
};

export type ClientProjectDetail = {
  project: ClientProject;
  progress: ProjectProgress[];
  documents: ProjectDocument[];
  maintenance?: MaintenancePlan;
  maintenanceLogs: MaintenanceLog[];
  invoices: ProjectInvoice[];
  activities: ProjectActivity[];
  reports: ProjectDocument[];
};

export type CreateClientPayload = {
  name: string;
  email: string;
  password: string;
  sendInvitation: boolean;
};

export type ProjectPayload = {
  clientId: string;
  name: string;
  description: string;
  picName: string;
  picEmail: string;
  startDate: string;
  targetEndDate: string;
  status: ProjectStatus;
  progressPercent: number;
  websiteUrl: string;
  stagingUrl: string;
  credentialNote: string;
  documentationUrl: string;
};

export type ProgressPayload = {
  title: string;
  status: ProgressStatus;
  percentage: number;
  note: string;
  documentUrl: string;
};

export type DocumentPayload = {
  title: string;
  category: DocumentCategory;
  url: string;
  description: string;
};

export type MaintenancePlanPayload = {
  type: string;
  periodStart: string;
  periodEnd: string;
  quotaTotal: number;
  isActive: boolean;
};

export type MaintenanceLogPayload = {
  requestDate: string;
  description: string;
  status: MaintenanceStatus;
  picName: string;
};

export type InvoicePayload = {
  number: string;
  amount: number;
  status: InvoiceStatus;
  issuedAt: string;
  dueAt: string;
  paidAt: string;
  documentUrl: string;
  paymentNote: string;
};
