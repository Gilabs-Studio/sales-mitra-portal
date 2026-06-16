import type { BreakdownItem, MetricCard } from "../types/dashboard.types";

export function MetricGrid({ metrics }: { metrics: MetricCard[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
      {metrics.map((metric) => (
        <section
          key={metric.label}
          className="rounded-2xl border border-border/40 bg-secondary/60 p-3 transition-all duration-300 hover:shadow-sm sm:p-4"
        >
          <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-muted-foreground sm:text-[10px]">
            {metric.label}
          </p>
          <p className="mt-1.5 text-xl font-extrabold tracking-tight text-foreground sm:mt-2 sm:text-2xl">
            {metric.value.toLocaleString("id-ID")}
          </p>
        </section>
      ))}
    </div>
  );
}

export function BreakdownGrid({ title, items }: { title: string; items: BreakdownItem[] }) {
  return (
    <section className="rounded-2xl border border-border/40 bg-secondary/45 p-4">
      <h2 className="text-sm font-extrabold text-foreground">{title}</h2>
      <div className="mt-3 space-y-2.5">
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
