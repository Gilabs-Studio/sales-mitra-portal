export type ServiceType = "company_profile" | "website_app" | "custom_software" | "salesview" | "other" | (string & {});

export type LeadStatus = "submitted" | "qualified" | "contacted" | "won" | "lost" | "rejected";

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
