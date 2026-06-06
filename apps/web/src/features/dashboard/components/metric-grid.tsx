import type { BreakdownItem, MetricCard } from "../types/dashboard.types";

export function MetricGrid({ metrics }: { metrics: MetricCard[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-4">
      {metrics.map((metric) => (
        <section key={metric.label} className="rounded-lg border border-border bg-card p-5">
          <p className="text-xs font-semibold uppercase text-muted-foreground">{metric.label}</p>
          <p className="mt-3 text-3xl font-extrabold text-foreground">{metric.value.toLocaleString("id-ID")}</p>
        </section>
      ))}
    </div>
  );
}

export function BreakdownGrid({ title, items }: { title: string; items: BreakdownItem[] }) {
  return (
    <section className="rounded-lg border border-border bg-card p-5">
      <h2 className="text-lg font-extrabold text-foreground">{title}</h2>
      <div className="mt-4 space-y-3">
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">Belum ada data.</p>
        ) : (
          items.map((item) => (
            <div key={item.key}>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="font-semibold text-foreground">{item.label}</span>
                <span className="text-muted-foreground">{item.count}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-lg bg-secondary">
                <div className="h-full rounded-lg bg-accent" style={{ width: `${Math.min(100, item.count * 16)}%` }} />
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
