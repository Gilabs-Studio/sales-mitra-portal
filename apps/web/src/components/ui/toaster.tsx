"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";
import { useToastStore, type ToastItem } from "@/features/dashboard/stores/use-toast-store";

function Toast({ toast }: { toast: ToastItem }) {
  const dismissToast = useToastStore((state) => state.dismissToast);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      dismissToast(toast.id);
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast.id, dismissToast]);

  const icons = {
    success: <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />,
    error: <AlertCircle className="h-5 w-5 text-destructive shrink-0" />,
    info: <Info className="h-5 w-5 text-primary shrink-0" />,
  };

  const borders = {
    success: "border-emerald-500/20 bg-emerald-500/5",
    error: "border-destructive/20 bg-destructive/5",
    info: "border-primary/20 bg-primary/5",
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 15, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, y: -10, transition: { duration: 0.15 } }}
      transition={{ type: "spring", stiffness: 350, damping: 30 }}
      className={`flex items-start gap-3 w-80 max-w-full rounded-lg border bg-card/90 backdrop-blur-md p-4 shadow-xl ${borders[toast.type] || "border-border"}`}
    >
      {icons[toast.type]}
      <div className="flex-1 text-xs font-semibold leading-relaxed text-foreground">
        {toast.message}
      </div>
      <button
        onClick={() => dismissToast(toast.id)}
        className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer rounded p-0.5"
        aria-label="Tutup notifikasi"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </motion.div>
  );
}

export function Toaster() {
  const toasts = useToastStore((state) => state.toasts);

  return (
    <div className="fixed bottom-6 right-6 z-[200] flex flex-col gap-2 pointer-events-none">
      <div className="pointer-events-auto flex flex-col gap-2">
        <AnimatePresence>
          {toasts.map((toast) => (
            <Toast key={toast.id} toast={toast} />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
