import { formatCurrency } from "@/lib/utils";
import type { ServiceRule } from "../types/service.types";

export function serviceBudgetLabel(service: ServiceRule) {
  if (service.minimumBudget <= 0) {
    return "Tanpa minimum";
  }
  return `Min ${formatCurrency(service.minimumBudget)}`;
}
