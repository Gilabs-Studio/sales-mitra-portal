import type { LeadStatus, ServiceType } from "../types/lead.types";

export const statusLabels: Record<LeadStatus, string> = {
  submitted: "Submitted",
  qualified: "Qualified",
  contacted: "Contacted",
  won: "Won",
  lost: "Lost",
  rejected: "Rejected",
};

export const serviceLabels: Record<ServiceType, string> = {
  company_profile: "Company Profile",
  website_app: "Website/App",
  custom_software: "Custom Software",
  salesview: "SalesView",
};
