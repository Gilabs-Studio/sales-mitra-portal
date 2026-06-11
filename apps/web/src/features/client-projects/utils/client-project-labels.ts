import type {
  DocumentCategory,
  InvoiceStatus,
  MaintenanceStatus,
  ProgressStatus,
  ProjectStatus,
} from "../types/client-project.types";

export const projectStatusLabels: Record<ProjectStatus, string> = {
  discovery: "Discovery",
  planning: "Planning",
  development: "Development",
  testing: "Testing",
  deployment: "Deployment",
  completed: "Completed",
  maintenance: "Maintenance",
};

export const progressStatusLabels: Record<ProgressStatus, string> = {
  todo: "Todo",
  in_progress: "In Progress",
  blocked: "Blocked",
  done: "Done",
};

export const maintenanceStatusLabels: Record<MaintenanceStatus, string> = {
  open: "Open",
  in_progress: "In Progress",
  resolved: "Resolved",
  rejected: "Rejected",
};

export const invoiceStatusLabels: Record<InvoiceStatus, string> = {
  draft: "Draft",
  sent: "Sent",
  waiting_payment: "Waiting Payment",
  paid: "Paid",
  overdue: "Overdue",
};

export const documentCategoryLabels: Record<DocumentCategory, string> = {
  deliverable: "Deliverable",
  progress: "Progress",
  maintenance: "Maintenance",
  invoice: "Invoice",
  report: "Report",
  other: "Other",
};

export const projectStatusOptions = Object.entries(projectStatusLabels).map(([value, label]) => ({ value, label }));
export const progressStatusOptions = Object.entries(progressStatusLabels).map(([value, label]) => ({ value, label }));
export const maintenanceStatusOptions = Object.entries(maintenanceStatusLabels).map(([value, label]) => ({ value, label }));
export const invoiceStatusOptions = Object.entries(invoiceStatusLabels).map(([value, label]) => ({ value, label }));
export const documentCategoryOptions = Object.entries(documentCategoryLabels).map(([value, label]) => ({ value, label }));
