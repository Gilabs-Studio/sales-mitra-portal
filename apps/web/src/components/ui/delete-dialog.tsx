"use client";

import { Button } from "./button";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogTitle,
} from "./dialog";

type DeleteDialogProps = {
  open: boolean;
  itemName: string;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<void> | void;
};

export function DeleteDialog({ open, itemName, onOpenChange, onConfirm }: DeleteDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogOverlay className="bg-primary/30" />
      <DialogContent className="max-w-sm">
        <DialogHeader className="border-b-0 pb-2">
          <DialogTitle className="text-lg">Hapus {itemName}?</DialogTitle>
        </DialogHeader>
        <DialogBody className="pt-0">
          <p className="text-sm leading-6 text-muted-foreground">
          Aksi ini perlu dikonfirmasi sebelum data dihapus
          </p>
        </DialogBody>
        <DialogFooter className="border-t-0 pt-0">
          <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
            Batal
          </Button>
          <Button type="button" variant="danger" onClick={onConfirm}>
            Hapus
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
