"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Calendar ──────────────────────────────────────────────────────────────

type CalendarEvent = {
  date: string; // "YYYY-MM-DD"
  label: string;
  color?: "primary" | "success" | "warning" | "destructive";
};

type CalendarProps = {
  value?: Date | null;
  onChange?: (date: Date) => void;
  events?: CalendarEvent[];
  className?: string;
};

const DAYS_SHORT = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
const MONTHS_ID = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function toDateString(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function Calendar({ value, onChange, events = [], className }: CalendarProps) {
  const today = new Date();
  const [viewDate, setViewDate] = React.useState(value ?? today);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const nextMonth = () => setViewDate(new Date(year, month + 1, 1));

  const eventMap = React.useMemo(() => {
    const map: Record<string, CalendarEvent[]> = {};
    for (const ev of events) {
      (map[ev.date] ??= []).push(ev);
    }
    return map;
  }, [events]);

  const dotColor: Record<string, string> = {
    primary: "bg-primary",
    success: "bg-success",
    warning: "bg-warning",
    destructive: "bg-destructive",
  };

  const cells: (number | null)[] = [
    ...Array.from({ length: firstDay }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <div className={cn("rounded-lg border border-border bg-card p-4", className)}>
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <button
          type="button"
          onClick={prevMonth}
          className="cursor-pointer rounded-lg p-1.5 transition-colors hover:bg-secondary"
          aria-label="Bulan sebelumnya"
        >
          <ChevronLeft className="h-4 w-4 text-muted-foreground" />
        </button>
        <span className="text-sm font-semibold text-foreground">
          {MONTHS_ID[month]} {year}
        </span>
        <button
          type="button"
          onClick={nextMonth}
          className="cursor-pointer rounded-lg p-1.5 transition-colors hover:bg-secondary"
          aria-label="Bulan berikutnya"
        >
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>

      {/* Day headers */}
      <div className="mb-1 grid grid-cols-7">
        {DAYS_SHORT.map((d) => (
          <div key={d} className="py-1 text-center text-xs font-medium text-muted-foreground">
            {d}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7 gap-y-1">
        {cells.map((day, idx) => {
          if (!day) return <div key={`empty-${idx}`} />;
          const date = new Date(year, month, day);
          const dateStr = toDateString(date);
          const isToday = isSameDay(date, today);
          const isSelected = value ? isSameDay(date, value) : false;
          const dayEvents = eventMap[dateStr] ?? [];

          return (
            <button
              key={day}
              type="button"
              onClick={() => onChange?.(date)}
              className={cn(
                "relative mx-auto flex h-8 w-8 cursor-pointer flex-col items-center justify-center rounded-lg text-sm transition-all duration-200",
                isSelected
                  ? "bg-primary font-bold text-primary-foreground"
                  : isToday
                    ? "bg-primary/10 font-semibold text-primary"
                    : "text-foreground hover:bg-secondary",
              )}
            >
              {day}
              {dayEvents.length > 0 && (
                <span className="absolute bottom-0.5 flex gap-px">
                  {dayEvents.slice(0, 3).map((ev, i) => (
                    <span
                      key={i}
                      className={cn("h-1 w-1 rounded-full", dotColor[ev.color ?? "primary"])}
                    />
                  ))}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── TimeSlotPicker ─────────────────────────────────────────────────────────

type TimeSlotPickerProps = {
  value?: string; // "HH:mm"
  onChange?: (time: string) => void;
  /** Slots to show. Default: 09:00 – 17:00 every 30 min */
  slots?: string[];
  className?: string;
};

function generateDefaultSlots() {
  const s: string[] = [];
  for (let h = 9; h <= 17; h++) {
    s.push(`${String(h).padStart(2, "0")}:00`);
    if (h < 17) s.push(`${String(h).padStart(2, "0")}:30`);
  }
  return s;
}

export function TimeSlotPicker({
  value,
  onChange,
  slots = generateDefaultSlots(),
  className,
}: TimeSlotPickerProps) {
  return (
    <div className={cn("rounded-lg border border-border bg-card p-4", className)}>
      <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
        <Clock className="h-4 w-4 text-muted-foreground" />
        Pilih Jam Meeting
      </div>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
        {slots.map((slot) => (
          <button
            key={slot}
            type="button"
            onClick={() => onChange?.(slot)}
            className={cn(
              "cursor-pointer rounded-lg border px-2 py-1.5 text-xs font-medium transition-all duration-200",
              value === slot
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-secondary text-foreground hover:border-primary hover:bg-primary/10 hover:text-primary",
            )}
          >
            {slot}
          </button>
        ))}
      </div>
    </div>
  );
}
