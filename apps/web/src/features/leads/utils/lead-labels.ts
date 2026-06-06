import type { LeadStatus, ServiceType } from "../types/lead.types";

export const statusLabels: Record<LeadStatus, string> = {
  submitted: "Menunggu Review",
  qualified: "Qualified",
  contacted: "Contacted",
  won: "Won",
  lost: "Lost",
  rejected: "Rejected",
};

export const serviceLabels: Partial<Record<ServiceType, string>> = {
  company_profile: "Company Profile",
  website_app: "Website/App",
  custom_software: "Custom Software",
  salesview: "SalesView",
  other: "Lainnya",
};

export function serviceLabel(serviceType: ServiceType) {
  return serviceLabels[serviceType] ?? serviceType.replaceAll("_", " ");
}
