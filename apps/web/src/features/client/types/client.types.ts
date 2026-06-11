export type ProjectStatus =
  | "discovery"
  | "planning"
  | "development"
  | "testing"
  | "deployment"
  | "completed"
  | "maintenance";

export type ProgressStatus = "pending" | "in_progress" | "completed";

export type InvoiceStatus = "draft" | "sent" | "waiting_payment" | "paid" | "overdue";

export interface Project {
  id: string;
  clientId: string;
  clientName?: string;
  clientEmail?: string;
  name: string;
  description: string;
  picName: string;
  picContact: string;
  startDate: string;
  targetEndDate: string;
  status: ProjectStatus;
  websiteUrl: string;
  stagingUrl: string;
  credentials?: string;
  documentation?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectProgress {
  id: string;
  projectId: string;
  title: string;
  status: ProgressStatus;
  percentage: number;
  updateDate: string;
  notes: string;
  documentUrl?: string;
  createdAt: string;
}

export interface ProjectDocument {
  id: string;
  projectId: string;
  title: string;
  documentUrl: string;
  uploadedAt: string;
}

export interface ProjectMaintenance {
  id: string;
  projectId: string;
  packageName: string;
  startDate: string;
  endDate: string;
  quotaLimit: number;
  quotaUsed: number;
  createdAt: string;
  updatedAt: string;
}

export interface MaintenanceLog {
  id: string;
  projectId: string;
  requestDate: string;
  description: string;
  status: ProgressStatus;
  picName: string;
  createdAt: string;
}

export interface ProjectInvoice {
  id: string;
  projectId: string;
  projectName?: string;
  invoiceNumber: string;
  amount: number;
  status: InvoiceStatus;
  issueDate: string;
  dueDate: string;
  documentUrl: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuditLog {
  id: string;
  actorId: string;
  actorName: string;
  actorRole: string;
  action: string;
  targetType: string;
  targetId: string;
  details: string;
  createdAt: string;
}

export interface ClientDashboardData {
  projects: Project[];
  totalProjects: number;
  activeProjects: number;
  unpaidInvoicesCount: number;
  unpaidInvoicesAmount: number;
  maintenance: ProjectMaintenance[];
  notifications: AuditLog[];
}
