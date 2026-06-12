"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

type DialogContextValue = {
  onOpenChange: (open: boolean) => void;
};

const DialogContext = React.createContext<DialogContextValue | null>(null);

type DialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
};

export function Dialog({ open, onOpenChange, children }: DialogProps) {
  React.useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onOpenChange(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onOpenChange]);

  if (!open) return null;

  return (
    <DialogContext.Provider value={{ onOpenChange }}>
      <div className="fixed inset-0 z-[100]">
        {children}
      </div>
    </DialogContext.Provider>
  );
}

type DialogOverlayProps = {
  className?: string;
};

export function DialogOverlay({ className }: DialogOverlayProps) {
  const context = React.useContext(DialogContext);

  return (
    <div
      aria-hidden="true"
      className={cn("absolute inset-0 bg-black/40 backdrop-blur-sm", className)}
      onClick={() => context?.onOpenChange(false)}
    />
  );
}

type DialogContentProps = {
  children: React.ReactNode;
  className?: string;
  containerClassName?: string;
  hideCloseButton?: boolean;
};

export function DialogContent({
  children,
  className,
  containerClassName,
  hideCloseButton = false,
}: DialogContentProps) {
  const context = React.useContext(DialogContext);

  return (
    <div
      className={cn(
        "pointer-events-none relative flex min-h-full items-center justify-center p-4",
        containerClassName,
      )}
    >
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          "pointer-events-auto relative w-full rounded-lg border border-border bg-card shadow-2xl",
          className,
        )}
        onClick={(event) => event.stopPropagation()}
      >
        {!hideCloseButton && (
          <button
            type="button"
            onClick={() => context?.onOpenChange(false)}
            className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            aria-label="Tutup dialog"
          >
            <X className="h-4 w-4" />
          </button>
        )}
        {children}
      </div>
    </div>
  );
}

type DialogHeaderProps = {
  children: React.ReactNode;
  className?: string;
};

export function DialogHeader({ children, className }: DialogHeaderProps) {
  return (
    <div className={cn("border-b border-border px-6 py-5", className)}>
      {children}
    </div>
  );
}

type DialogTitleProps = {
  children: React.ReactNode;
  className?: string;
};

export function DialogTitle({ children, className }: DialogTitleProps) {
  return (
    <h2 className={cn("text-xl font-extrabold text-foreground", className)}>
      {children}
    </h2>
  );
}

type DialogDescriptionProps = {
  children: React.ReactNode;
  className?: string;
};

export function DialogDescription({ children, className }: DialogDescriptionProps) {
  return (
    <p className={cn("mt-1.5 text-sm leading-relaxed text-muted-foreground", className)}>
      {children}
    </p>
  );
}

type DialogBodyProps = {
  children: React.ReactNode;
  className?: string;
};

export function DialogBody({ children, className }: DialogBodyProps) {
  return (
    <div className={cn("px-6 py-5", className)}>
      {children}
    </div>
  );
}

type DialogFooterProps = {
  children: React.ReactNode;
  className?: string;
};

export function DialogFooter({ children, className }: DialogFooterProps) {
  return (
    <div className={cn("flex justify-end gap-2 border-t border-border px-6 py-4", className)}>
      {children}
    </div>
  );
}
