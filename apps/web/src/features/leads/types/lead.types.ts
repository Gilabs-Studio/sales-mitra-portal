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
  unreadCount: number;
  messageCount: number;
  meetingMessage?: string;
  commissionRate: number;
  dealAmount: number;
  createdAt: string;
  updatedAt: string;
};

export type LeadWithPartner = Lead & {
  partnerName: string;
  partnerEmail: string;
  partnerCode: string;
  partnerSuspended: boolean;
  unreadCount: number;
  messageCount: number;
  meetingMessage?: string;
};

export type LeadEvent = {
  id: string;
  leadId: string;
  actorId: string;
  actorName: string;
  status: LeadStatus;
  note: string;
  createdAt: string;
};

export type LeadMessage = {
  id: string;
  leadId: string;
  senderId: string;
  senderName: string;
  senderRole: "admin" | "partner";
  message: string;
  isRead: boolean;
  createdAt: string;
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
  page?: number;
  pageSize?: number;
};

export type PaginationMeta = {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export type PaginatedLeads<T> = PaginationMeta & {
  data: T[];
};

export type UpdateLeadStatusPayload = {
  status: LeadStatus;
  note: string;
};

export type LeadPayout = {
  id: string;
  leadId: string;
  amountPaid: number;
  commissionPaid: number;
  evidenceUrl: string;
  createdAt: string;
};

export type PayoutSummary = {
  commissionRate: number;
  dealAmount: number;
  totalCommission: number;
  clientPaid: number;
  partnerPayout: number;
  payoutProgress: number;
  remainingCommission: number;
};
