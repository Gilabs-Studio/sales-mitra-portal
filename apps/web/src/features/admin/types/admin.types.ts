import type { Role } from "@/features/auth/types/auth.types";

export type CreateAdminPayload = {
  name: string;
  username: string;
  email: string;
  password: string;
};

export type UpdateUserSuspensionPayload = {
  isSuspended: boolean;
  reason: string;
};

export type AdminUser = {
  id: string;
  name: string;
  username: string;
  email: string;
  role: Role;
  partnerCode: string;
  isSuspended: boolean;
  suspendedReason: string;
  createdAt: string;
};

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
