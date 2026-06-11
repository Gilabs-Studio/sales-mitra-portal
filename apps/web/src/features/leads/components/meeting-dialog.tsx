"use client";

import * as React from "react";
import { CalendarDays, Check } from "lucide-react";
import { Calendar, TimeSlotPicker } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
} from "@/components/ui/dialog";
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
  if (!open) return null;

  return (
    <MeetingDialogContent
      initial={initial}
      onClose={onClose}
      onConfirm={onConfirm}
    />
  );
}

type MeetingDialogContentProps = {
  initial?: ScheduledMeeting | null;
  onClose: () => void;
  onConfirm: (meeting: ScheduledMeeting) => void;
};

function MeetingDialogContent({ initial, onClose, onConfirm }: MeetingDialogContentProps) {
  const [date, setDate] = React.useState<Date | null>(initial?.date ?? null);
  const [time, setTime] = React.useState<string | undefined>(initial?.time);

  const canConfirm = !!date && !!time;

  return (
    <Dialog open onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      <DialogOverlay className="bg-black/60" />
      <DialogContent className="max-w-sm">
        <DialogHeader className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <CalendarDays className="h-4 w-4 text-primary" />
            Jadwalkan Meeting
          </div>
        </DialogHeader>

        <DialogBody className="space-y-4 p-4">
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
        </DialogBody>

        <DialogFooter className="px-4 py-3">
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
        </DialogFooter>
      </DialogContent>
    </Dialog>
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
