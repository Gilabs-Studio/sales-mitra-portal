import type { ServiceType } from "@/features/leads/types/lead.types";

export type ServiceRule = {
  type: ServiceType;
  label: string;
  description: string;
  minimumBudget: number;
  requiresDiscovery: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ServiceRulePayload = {
  type: ServiceType;
  label: string;
  description: string;
  minimumBudget: number;
  requiresDiscovery: boolean;
  isActive: boolean;
};
