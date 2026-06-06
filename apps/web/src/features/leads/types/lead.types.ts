export type ServiceType = "company_profile" | "website_app" | "custom_software" | "salesview";

export type LeadStatus = "submitted" | "qualified" | "contacted" | "won" | "lost" | "rejected";

export type ServiceRule = {
  type: ServiceType;
  label: string;
  description: string;
  minimumBudget: number;
  requiresDiscovery: boolean;
};

export type Lead = {
  id: string;
  partnerId: string;
  companyName: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  serviceType: ServiceType;
  budget: number;
  needSummary: string;
  notes: string;
  status: LeadStatus;
  qualificationScore: number;
  qualificationNote: string;
  createdAt: string;
  updatedAt: string;
};

export type LeadWithPartner = Lead & {
  partnerName: string;
  partnerEmail: string;
  partnerCode: string;
};

export type CreateLeadPayload = {
  companyName: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  serviceType: ServiceType;
  budget: number;
  needSummary: string;
  notes: string;
};

export type LeadFilters = {
  status?: LeadStatus | "";
  serviceType?: ServiceType | "";
  limit?: number;
};

export type UpdateLeadStatusPayload = {
  status: LeadStatus;
  note: string;
};
