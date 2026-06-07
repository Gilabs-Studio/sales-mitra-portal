"use client";

import * as React from "react";
import { Ban, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUpdateUserSuspension } from "../hooks/use-admin";

type SuspendAccountButtonProps = {
  leadId: string;
  partnerId: string;
  partnerName: string;
  isSuspended: boolean;
};

export function SuspendAccountButton({
  leadId,
  partnerId,
  partnerName,
  isSuspended,
}: SuspendAccountButtonProps) {
  const mutation = useUpdateUserSuspension(partnerId);
  const [message, setMessage] = React.useState("");

  async function onToggleSuspension() {
    setMessage("");

    if (isSuspended) {
      await mutation.mutateAsync({ isSuspended: false, reason: "" });
      setMessage("Akun partner berhasil diaktifkan kembali.");
      return;
    }

    const reason = window.prompt(`Alasan suspend akun ${partnerName}:`, "Pelanggaran kebijakan komunikasi");
    if (reason === null) {
      return;
    }

    await mutation.mutateAsync({ isSuspended: true, reason });
    setMessage("Akun partner disuspend. Akses login dan token aktif akan langsung diblokir.");
  }

  return (
    <div className="space-y-2">
      <Button
        type="button"
        variant={isSuspended ? "secondary" : "danger"}
        isLoading={mutation.isPending}
        onClick={onToggleSuspension}
        className="w-full"
      >
        {isSuspended ? <ShieldCheck className="h-4 w-4" aria-hidden="true" /> : <Ban className="h-4 w-4" aria-hidden="true" />}
        {isSuspended ? "Aktifkan kembali akun" : "Suspend akun partner"}
      </Button>
      {mutation.error instanceof Error ? (
        <p className="text-xs font-semibold text-destructive">{mutation.error.message}</p>
      ) : null}
      {message ? <p className="text-xs font-semibold text-emerald-600">{message}</p> : null}
      <p className="text-[11px] leading-5 text-muted-foreground">
        Lead aktif: <span className="font-semibold text-foreground">{leadId}</span>
      </p>
    </div>
  );
}
