"use client";

import { Select } from "@/components/ui/select";
import { useLeadFilters, serviceOptions, statusOptions } from "../hooks/use-leads";
import { serviceLabels, statusLabels } from "../utils/lead-labels";

export function LeadFilters() {
  const { status, serviceType, setStatus, setServiceType } = useLeadFilters();

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
        {serviceOptions.map((item) => (
          <option key={item || "all"} value={item}>
            {item ? serviceLabels[item] : "Semua layanan"}
          </option>
        ))}
      </Select>
    </div>
  );
}
