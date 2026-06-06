"use client";

import { Select } from "@/components/ui/select";
import { useServiceCatalog } from "@/features/services/hooks/use-services";
import { useLeadFilters, statusOptions } from "../hooks/use-leads";
import { serviceLabel, statusLabels } from "../utils/lead-labels";

export function LeadFilters() {
  const { status, serviceType, setStatus, setServiceType } = useLeadFilters();
  const services = useServiceCatalog();

  return (
    <div className="grid gap-3 md:grid-cols-2">
      <Select value={status} onChange={(event) => setStatus(event.target.value as typeof status)}>
        {statusOptions.map((item) => (
          <option key={item || "all"} value={item}>
            {item ? statusLabels[item] : "Semua status"}
          </option>
        ))}
      </Select>
      <Select value={serviceType} onChange={(event) => setServiceType(event.target.value as typeof serviceType)}>
        <option value="">Semua layanan</option>
        {(services.data ?? []).map((item) => (
          <option key={item.type} value={item.type}>
            {serviceLabel(item.type)}
          </option>
        ))}
      </Select>
    </div>
  );
}
