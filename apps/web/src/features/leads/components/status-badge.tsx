import type { LeadStatus } from "../types/lead.types";
import { statusLabels } from "../utils/lead-labels";
import { cn } from "@/lib/utils";

const styles: Record<LeadStatus, string> = {
  submitted: "border-border bg-secondary text-foreground",
  qualified: "border-success bg-success/10 text-success",
  contacted: "border-accent bg-accent/10 text-foreground",
  won: "border-success bg-success text-primary-foreground",
  lost: "border-muted-foreground bg-muted text-muted-foreground",
  rejected: "border-destructive bg-destructive/10 text-destructive",
};

export function StatusBadge({ status }: { status: LeadStatus }) {
  return (
    <span className={cn("inline-flex rounded-lg border px-2.5 py-1 text-xs font-semibold", styles[status])}>
      {statusLabels[status]}
    </span>
  );
}
