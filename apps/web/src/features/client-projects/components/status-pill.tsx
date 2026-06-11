import { cn } from "@/lib/utils";
import type { InvoiceStatus, MaintenanceStatus, ProgressStatus, ProjectStatus } from "../types/client-project.types";
import {
  invoiceStatusLabels,
  maintenanceStatusLabels,
  progressStatusLabels,
  projectStatusLabels,
} from "../utils/client-project-labels";

type StatusType = "project" | "progress" | "maintenance" | "invoice";

const statusStyles: Record<string, string> = {
  discovery: "border-accent bg-accent/10 text-foreground",
  planning: "border-warning bg-warning/10 text-warning",
  development: "border-primary bg-primary/10 text-primary",
  testing: "border-accent bg-accent/10 text-foreground",
  deployment: "border-primary bg-primary text-primary-foreground",
  completed: "border-success bg-success text-primary-foreground",
  maintenance: "border-success bg-success/10 text-success",
  todo: "border-muted-foreground bg-muted text-muted-foreground",
  in_progress: "border-primary bg-primary/10 text-primary",
  blocked: "border-warning bg-warning/10 text-warning",
  done: "border-success bg-success text-primary-foreground",
  open: "border-warning bg-warning/10 text-warning",
  resolved: "border-success bg-success text-primary-foreground",
  rejected: "border-destructive bg-destructive/10 text-destructive",
  draft: "border-muted-foreground bg-muted text-muted-foreground",
  sent: "border-accent bg-accent/10 text-foreground",
  waiting_payment: "border-warning bg-warning/10 text-warning",
  paid: "border-success bg-success text-primary-foreground",
  overdue: "border-destructive bg-destructive text-primary-foreground",
};

type StatusValue = ProjectStatus | ProgressStatus | MaintenanceStatus | InvoiceStatus;

export function StatusPill({
  type,
  status,
  className,
}: {
  type: StatusType;
  status: StatusValue;
  className?: string;
}) {
  return (
    <span className={cn("inline-flex rounded-lg border px-2.5 py-1 text-xs font-semibold", statusStyles[status], className)}>
      {labelFor(type, status)}
    </span>
  );
}

function labelFor(type: StatusType, status: StatusValue) {
  if (type === "project") {
    return projectStatusLabels[status as ProjectStatus];
  }
  if (type === "progress") {
    return progressStatusLabels[status as ProgressStatus];
  }
  if (type === "maintenance") {
    return maintenanceStatusLabels[status as MaintenanceStatus];
  }
  return invoiceStatusLabels[status as InvoiceStatus];
}
