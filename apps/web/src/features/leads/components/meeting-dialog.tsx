"use client";

import * as React from "react";
import { CalendarDays, X, Check } from "lucide-react";
import { Calendar, TimeSlotPicker } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type ScheduledMeeting = {
  date: Date;
  time: string;
};

type MeetingDialogProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: (meeting: ScheduledMeeting) => void;
  initial?: ScheduledMeeting | null;
};

export function MeetingDialog({ open, onClose, onConfirm, initial }: MeetingDialogProps) {
  const [date, setDate] = React.useState<Date | null>(initial?.date ?? null);
  const [time, setTime] = React.useState<string | undefined>(initial?.time);

  // Reset when reopened
  React.useEffect(() => {
    if (open) {
      setDate(initial?.date ?? null);
      setTime(initial?.time);
    }
  }, [open, initial]);

  if (!open) return null;

  const canConfirm = !!date && !!time;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/60"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Dialog */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Jadwal Meeting"
        className="fixed left-1/2 top-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-lg border border-border bg-card shadow-xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <CalendarDays className="h-4 w-4 text-primary" />
            Jadwalkan Meeting
          </div>
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-lg p-1 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            aria-label="Tutup"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="space-y-4 p-4">
          <Calendar value={date} onChange={setDate} />

          {date && (
            <TimeSlotPicker value={time} onChange={setTime} />
          )}

          {date && time && (
            <div className="rounded-lg bg-primary/10 px-3 py-2 text-xs text-primary">
              📅{" "}
              {date.toLocaleDateString("id-ID", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}{" "}
              pukul <strong>{time}</strong>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 border-t border-border px-4 py-3">
          <Button type="button" variant="ghost" onClick={onClose}>
            Batal
          </Button>
          <Button
            type="button"
            disabled={!canConfirm}
            onClick={() => {
              if (date && time) {
                onConfirm({ date, time });
                onClose();
              }
            }}
          >
            <Check className="h-4 w-4" />
            Konfirmasi
          </Button>
        </div>
      </div>
    </>
  );
}

/** Small trigger button that shows the current scheduled meeting or opens the dialog */
type MeetingTriggerProps = {
  scheduled: ScheduledMeeting | null;
  onClick: () => void;
  className?: string;
};

export function MeetingTrigger({ scheduled, onClick, className }: MeetingTriggerProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Jadwalkan meeting"
      title={
        scheduled
          ? `Meeting: ${scheduled.date.toLocaleDateString("id-ID")} ${scheduled.time}`
          : "Jadwalkan meeting"
      }
      className={cn(
        "cursor-pointer rounded-lg p-2 transition-colors",
        scheduled
          ? "text-primary hover:bg-primary/10"
          : "text-muted-foreground hover:bg-secondary hover:text-foreground",
        className,
      )}
    >
      <CalendarDays className="h-5 w-5" />
    </button>
  );
}
