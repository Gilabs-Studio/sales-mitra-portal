import type { Lead, LeadWithPartner } from "@/features/leads/types/lead.types";

export type MetricCard = {
  label: string;
  value: number;
};

export type BreakdownItem = {
  key: string;
  label: string;
  count: number;
};

export type Referral = {
  id: string;
  partnerId: string;
  product: string;
  code: string;
  usageCount: number;
  createdAt: string;
};

export type PartnerDashboard = {
  summary: MetricCard[];
  statusBreakdown: BreakdownItem[];
  serviceBreakdown: BreakdownItem[];
  recentLeads: Lead[];
  referrals: Referral[];
};

export type AdminDashboard = {
  summary: MetricCard[];
  statusBreakdown: BreakdownItem[];
  serviceBreakdown: BreakdownItem[];
  recentLeads: LeadWithPartner[];
};
