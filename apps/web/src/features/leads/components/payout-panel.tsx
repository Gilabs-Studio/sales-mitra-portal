"use client";

import * as React from "react";
import { Coins, Percent, TrendingUp, Upload, Calendar, Eye, X, Check, FileText } from "lucide-react";
import { ApiClientError } from "@/lib/api-client";
import { getPublicAssetOrigin } from "@/lib/api-url";
import { Button } from "@/components/ui/button";
import { Dialog, DialogBody, DialogContent, DialogFooter, DialogHeader, DialogOverlay } from "@/components/ui/dialog";
import { NumericInput } from "@/components/ui/numeric-input";
import { Field, FieldLabel, FieldGroup, FieldError, FieldDescription } from "@/components/ui/field";
import { useLeadPayouts, useCreatePayout, useUpdateLeadCommission } from "../hooks/use-leads";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { LeadPayout } from "../types/lead.types";

type PayoutPanelProps = {
  leadId: string;
  role: "partner" | "admin";
};

export function PayoutPanel({ leadId, role }: PayoutPanelProps) {
  const { data: queryData, isLoading, isError, refetch } = useLeadPayouts(leadId, role);
  const createPayoutMutation = useCreatePayout(leadId);
  const updateCommissionMutation = useUpdateLeadCommission(leadId);

  // Form states
  const [dealAmount, setDealAmount] = React.useState<number | undefined>(undefined);
  const [commissionRate, setCommissionRate] = React.useState<number | undefined>(undefined);
  const [clientPaid, setClientPaid] = React.useState<number>(0);
  const [evidenceFile, setEvidenceFile] = React.useState<File | null>(null);
  const [filePreview, setFilePreview] = React.useState<string | null>(null);

  // UI States
  const [showEditCommission, setShowEditCommission] = React.useState(false);
  const [showAddPayout, setShowAddPayout] = React.useState(false);
  const [activeReceiptUrl, setActiveReceiptUrl] = React.useState<string | null>(null);
  const [formError, setFormError] = React.useState<string | null>(null);
  const [formSuccess, setFormSuccess] = React.useState<string | null>(null);

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const payouts = queryData?.payouts ?? [];
  const summary = queryData?.summary;
  const handleUpdateCommission = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);
    if (!summary) return;

    const nextDealAmount = dealAmount ?? summary.dealAmount;
    const nextCommissionRate = commissionRate ?? summary.commissionRate;

    if (nextDealAmount < 0) {
      setFormError("Nilai deal tidak boleh negatif");
      return;
    }
    if (nextCommissionRate < 0 || nextCommissionRate > 100) {
      setFormError("Persen bagi hasil harus di antara 0 dan 100");
      return;
    }

    try {
      await updateCommissionMutation.mutateAsync({
        dealAmount: nextDealAmount,
        commissionRate: nextCommissionRate,
      });
      setFormSuccess("Bagi hasil berhasil diperbarui");
      setShowEditCommission(false);
    } catch (err: unknown) {
      setFormError(err instanceof ApiClientError ? err.message : "Gagal menyimpan perubahan");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setEvidenceFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddPayout = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    if (clientPaid <= 0) {
      setFormError("Nominal pembayaran client harus diisi dan bernilai positif");
      return;
    }
    if (!evidenceFile) {
      setFormError("Bukti transfer wajib diunggah");
      return;
    }

    try {
      await createPayoutMutation.mutateAsync({
        amountPaid: clientPaid,
        evidence: evidenceFile,
      });
      setFormSuccess("Payout pembayaran berhasil dicatat!");
      setClientPaid(0);
      setEvidenceFile(null);
      setFilePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      setShowAddPayout(false);
      void refetch();
    } catch (err: unknown) {
      setFormError(err instanceof ApiClientError ? err.message : "Gagal menambahkan data payout");
    }
  };

  const resolveEvidenceUrl = (url: string) => {
    if (!url) return "";
    if (url.startsWith("http://") || url.startsWith("https://")) {
      return url;
    }
    return `${getPublicAssetOrigin()}${url}`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-6">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (isError || !summary) {
    return (
      <p className="text-xs font-semibold text-destructive py-2">
        Gagal memuat status komisi & payout
      </p>
    );
  }

  const summaryData = summary;
  const effectiveDealAmount = dealAmount ?? summaryData.dealAmount;
  const effectiveCommissionRate = commissionRate ?? summaryData.commissionRate;
  const calculatedShare = clientPaid > 0 ? Math.round(clientPaid * (summaryData.commissionRate / 100)) : 0;

  return (
    <div className="space-y-5">
      {/* Target & Progress Header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-bold uppercase text-muted-foreground tracking-wider">
          <span>Progress Payout Komisi</span>
          <span className="text-primary font-bold">{Math.round(summary.payoutProgress)}%</span>
        </div>

        {/* Custom Progress Bar */}
        <div className="h-2.5 w-full bg-secondary rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-500 ease-out"
            style={{ width: `${Math.min(summary.payoutProgress, 100)}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Payout: {formatCurrency(summary.partnerPayout)}</span>
          <span>Target: {formatCurrency(summary.totalCommission)}</span>
        </div>
      </div>

      {/* Metrics Summary Grid */}
      <div className="grid grid-cols-2 gap-3 text-xs">
        <div className="bg-secondary/20 p-3 rounded-lg border border-border/40">
          <span className="text-muted-foreground block mb-0.5">Nilai Deal Kontrak</span>
          <span className="font-bold text-foreground block text-sm">{formatCurrency(summary.dealAmount)}</span>
        </div>
        <div className="bg-secondary/20 p-3 rounded-lg border border-border/40">
          <span className="text-muted-foreground block mb-0.5">Bagi Hasil Mitra</span>
          <span className="font-bold text-primary block text-sm">{summary.commissionRate}%</span>
        </div>
        <div className="bg-secondary/20 p-3 rounded-lg border border-border/40">
          <span className="text-muted-foreground block mb-0.5">Client Sudah Bayar</span>
          <span className="font-bold text-foreground block text-sm">{formatCurrency(summary.clientPaid)}</span>
        </div>
        <div className="bg-secondary/20 p-3 rounded-lg border border-border/40 col-span-1">
          <span className="text-muted-foreground block mb-0.5">Sisa Target Komisi</span>
          <span className="font-bold text-muted-foreground block text-sm">{formatCurrency(summary.remainingCommission)}</span>
        </div>
      </div>

      {/* Admin Actions panel */}
      {role === "admin" && (
        <div className="flex flex-col gap-2 pt-2">
          <div className="flex gap-2">
            <Button
              type="button"
              variant="secondary"
              className="flex-1 text-xs cursor-pointer h-8 min-h-0 border-border hover:bg-secondary"
              onClick={() => {
                setShowEditCommission(!showEditCommission);
                setShowAddPayout(false);
                setFormError(null);
                setFormSuccess(null);
              }}
            >
              Set Bagi Hasil
            </Button>
            <Button
              type="button"
              variant="primary"
              className="flex-1 text-xs cursor-pointer h-8 min-h-0 hover:shadow-md hover:shadow-primary/20"
              onClick={() => {
                setShowAddPayout(!showAddPayout);
                setShowEditCommission(false);
                setFormError(null);
                setFormSuccess(null);
              }}
            >
              Catat Pembayaran
            </Button>
          </div>

          {/* Feedback message overlay */}
          {formError && (
            <p className="text-[11px] font-semibold text-destructive bg-destructive/5 p-2 rounded-lg border border-destructive/20 mt-1">
              {formError}
            </p>
          )}
          {formSuccess && (
            <p className="text-[11px] font-semibold text-primary bg-primary/5 p-2 rounded-lg border border-primary/20 mt-1">
              {formSuccess}
            </p>
          )}

          {/* Edit commission Form */}
          {showEditCommission && (
            <form onSubmit={handleUpdateCommission} className="bg-secondary/35 border border-border/50 rounded-lg p-3 mt-1 space-y-3">
              <h4 className="font-bold text-xs text-foreground mb-1">Pengaturan Bagi Hasil Proyek</h4>
              <FieldGroup className="space-y-3">
                <Field className="space-y-1">
                  <FieldLabel className="text-[11px]">Nilai Kontrak Deal (Rp)</FieldLabel>
                  <NumericInput
                    value={effectiveDealAmount}
                    onChange={(val) => setDealAmount(val)}
                    placeholder="Nilai total deal"
                    className="min-h-9 text-xs"
                  />
                </Field>
                <Field className="space-y-1">
                  <FieldLabel className="text-[11px]">Persentase Komisi (%)</FieldLabel>
                  <input
                    type="number"
                    value={effectiveCommissionRate}
                    min={0}
                    max={100}
                    onChange={(e) => setCommissionRate(Number(e.target.value))}
                    className="min-h-9 w-full rounded-lg border border-input bg-card px-3 py-1.5 text-xs text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
                  />
                  <FieldDescription className="text-[10px]">
                    Komisi target bagi hasil mitra: <span className="font-bold text-foreground">{formatCurrency(Math.round(effectiveDealAmount * (effectiveCommissionRate / 100)))}</span>
                  </FieldDescription>
                </Field>
              </FieldGroup>
              <div className="flex gap-2 justify-end pt-1">
                <Button
                  type="button"
                  variant="ghost"
                  className="text-xs h-8 min-h-0 cursor-pointer"
                  onClick={() => setShowEditCommission(false)}
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  className="text-xs h-8 min-h-0 cursor-pointer"
                  disabled={updateCommissionMutation.isPending}
                >
                  {updateCommissionMutation.isPending ? "Menyimpan..." : "Simpan"}
                </Button>
              </div>
            </form>
          )}

          {/* Record payout Form */}
          {showAddPayout && (
            <form onSubmit={handleAddPayout} className="bg-secondary/35 border border-border/50 rounded-lg p-3 mt-1 space-y-3">
              <h4 className="font-bold text-xs text-foreground mb-1">Catat Pembayaran & Payout Baru</h4>
              <FieldGroup className="space-y-3">
                <Field className="space-y-1">
                  <FieldLabel className="text-[11px]">Nominal Pembayaran Client (Rp)</FieldLabel>
                  <NumericInput
                    value={clientPaid}
                    onChange={(val) => setClientPaid(val)}
                    placeholder="Jumlah dibayar client"
                    className="min-h-9 text-xs"
                  />
                  {clientPaid > 0 && (
                    <FieldDescription className="text-[10px] text-primary font-medium flex items-center gap-1 mt-0.5">
                      <Check className="h-3 w-3" />
                      Komisi mitra ({summary.commissionRate}%): {formatCurrency(calculatedShare)}
                    </FieldDescription>
                  )}
                </Field>

                <Field className="space-y-1">
                  <FieldLabel className="text-[11px]">Upload Bukti Payout/Transfer</FieldLabel>
                  <div className="flex items-center gap-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/png, image/jpeg"
                      onChange={handleFileChange}
                      className="hidden"
                      id="evidence-file-input"
                    />
                    <label
                      htmlFor="evidence-file-input"
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 border border-dashed border-border rounded-lg bg-card text-xs text-muted-foreground hover:bg-secondary cursor-pointer transition-colors"
                    >
                      <Upload className="h-3.5 w-3.5" />
                      {evidenceFile ? evidenceFile.name : "Pilih gambar JPG/PNG"}
                    </label>
                  </div>
                  {filePreview && (
                    <div className="mt-2 relative rounded-lg border border-border/60 overflow-hidden bg-card h-24 w-full flex items-center justify-center">
                      <img src={filePreview} alt="Bukti Payout Preview" className="h-full object-contain" />
                      <button
                        type="button"
                        className="absolute right-1 top-1 bg-destructive/80 text-white rounded-full p-0.5 hover:bg-destructive"
                        onClick={() => {
                          setEvidenceFile(null);
                          setFilePreview(null);
                          if (fileInputRef.current) fileInputRef.current.value = "";
                        }}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                  <FieldDescription className="text-[9px]">Bukti transfer otomatis dikonversi ke format WebP.</FieldDescription>
                </Field>
              </FieldGroup>
              <div className="flex gap-2 justify-end pt-1">
                <Button
                  type="button"
                  variant="ghost"
                  className="text-xs h-8 min-h-0 cursor-pointer"
                  onClick={() => setShowAddPayout(false)}
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  className="text-xs h-8 min-h-0 cursor-pointer"
                  disabled={createPayoutMutation.isPending}
                >
                  {createPayoutMutation.isPending ? "Menyimpan..." : "Simpan Payout"}
                </Button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Payout logs list */}
      <div className="space-y-3 pt-2">
        <h4 className="text-xs font-bold uppercase text-muted-foreground tracking-wider flex items-center gap-1.5">
          <Coins className="h-3.5 w-3.5 text-primary" />
          Riwayat Pembayaran
        </h4>
        {payouts.length === 0 ? (
          <p className="text-xs text-muted-foreground italic bg-secondary/10 p-3 rounded-lg text-center">
            Belum ada catatan pembayaran & payout.
          </p>
        ) : (
          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {payouts.map((item: LeadPayout) => (
              <div
                key={item.id}
                className="bg-card border border-border/50 rounded-lg p-2.5 flex items-start justify-between text-xs transition-colors hover:bg-secondary/15"
              >
                <div className="space-y-1">
                  <div className="font-semibold text-foreground">
                    Client: {formatCurrency(item.amountPaid)}
                  </div>
                  <div className="text-[10px] text-primary font-medium">
                    Komisi: {formatCurrency(item.commissionPaid)}
                  </div>
                  <div className="text-[9px] text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-2.5 w-2.5" />
                    {new Date(item.createdAt).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
                {item.evidenceUrl && (
                  <button
                    type="button"
                    onClick={() => setActiveReceiptUrl(item.evidenceUrl)}
                    className="flex h-7 px-2 items-center justify-center gap-1 border border-border rounded-lg bg-secondary hover:bg-secondary/80 text-[10px] font-bold text-foreground cursor-pointer transition-all active:scale-95 shrink-0"
                    title="Lihat Bukti Transfer"
                  >
                    <Eye className="h-3 w-3 text-muted-foreground" />
                    Bukti
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Evidence Image Lightbox Modal Overlay */}
      {activeReceiptUrl && (
        <Dialog open onOpenChange={(open) => !open && setActiveReceiptUrl(null)}>
          <DialogOverlay className="bg-black/70" />
          <DialogContent className="flex max-h-[85vh] max-w-lg flex-col overflow-hidden rounded-lg p-0" hideCloseButton>
            <DialogHeader className="flex items-center justify-between bg-secondary/30 p-3">
              <h3 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5 text-primary" />
                Bukti Pembayaran Payout
              </h3>
              <button
                type="button"
                className="text-muted-foreground hover:text-foreground cursor-pointer rounded p-1 hover:bg-secondary/40"
                onClick={() => setActiveReceiptUrl(null)}
              >
                <X className="h-4 w-4" />
              </button>
            </DialogHeader>
            <DialogBody className="flex min-h-0 flex-1 items-center justify-center overflow-auto bg-black/5 p-4">
              <img
                src={resolveEvidenceUrl(activeReceiptUrl)}
                alt="Bukti Transfer Payout"
                className="max-w-full max-h-[60vh] object-contain rounded-md"
              />
            </DialogBody>
            <DialogFooter className="bg-secondary/15 p-3">
              <Button
                type="button"
                variant="secondary"
                className="text-xs h-8 min-h-0 cursor-pointer"
                onClick={() => setActiveReceiptUrl(null)}
              >
                Tutup
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
