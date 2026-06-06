import type { Role } from "@/features/auth/types/auth.types";

export type PartnerWithStats = {
  id: string;
  name: string;
  email: string;
  role: Role;
  partnerCode: string;
  createdAt: string;
  totalLeads: number;
  qualifiedLeads: number;
  wonLeads: number;
  rejectedLeads: number;
};
