import type { BreakdownItem, MetricCard } from "../types/dashboard.types";

export function MetricGrid({ metrics }: { metrics: MetricCard[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-4">
      {metrics.map((metric) => (
        <section key={metric.label} className="rounded-lg bg-secondary/60 p-4 transition-all duration-300 hover:shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{metric.label}</p>
          <p className="mt-2 text-2xl font-extrabold tracking-tight text-foreground">{metric.value.toLocaleString("id-ID")}</p>
        </section>
      ))}
    </div>
  );
}

export function BreakdownGrid({ title, items }: { title: string; items: BreakdownItem[] }) {
  return (
    <section className="rounded-lg bg-secondary/45 p-4.5">
      <h2 className="text-sm font-extrabold text-foreground">{title}</h2>
      <div className="mt-3.5 space-y-2.5">
        {items.length === 0 ? (
          <p className="text-xs text-muted-foreground">Belum ada data</p>
        ) : (
          items.map((item) => (
            <div key={item.key}>
              <div className="mb-1 flex items-center justify-between text-xs font-semibold">
                <span className="text-foreground">{item.label}</span>
                <span className="text-muted-foreground">{item.count}</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded bg-card">
                <div className="h-full rounded bg-accent" style={{ width: `${Math.min(100, item.count * 16)}%` }} />
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
