"use client";

import { Button } from "./button";

type DeleteDialogProps = {
  open: boolean;
  itemName: string;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<void> | void;
};

export function DeleteDialog({ open, itemName, onOpenChange, onConfirm }: DeleteDialogProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-primary/30 px-4">
      <div className="w-full max-w-sm rounded-lg border border-border bg-card p-5 shadow-xl">
        <h2 className="text-lg font-extrabold text-foreground">Hapus {itemName}?</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Aksi ini perlu dikonfirmasi sebelum data dihapus.
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
            Batal
          </Button>
          <Button type="button" variant="danger" onClick={onConfirm}>
            Hapus
          </Button>
        </div>
      </div>
    </div>
  );
}
