"use client";

import { Download, Eye } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useProjectInvoices } from "../hooks/use-client";
import { formatCurrency } from "@/lib/utils";
import { resolveAssetUrl } from "@/lib/asset-url";

type ClientProjectInvoiceTabProps = {
  projectId: string;
  onPreviewPdf: (url: string, title: string) => void;
};

export function ClientProjectInvoiceTab({
  projectId,
  onPreviewPdf,
}: ClientProjectInvoiceTabProps) {
  const invoicesQuery = useProjectInvoices(projectId);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-extrabold text-foreground">
        Daftar Invoice & Pembayaran
      </h3>
      {invoicesQuery.isLoading ? (
        <div className="h-32 animate-pulse rounded-md bg-muted" />
      ) : invoicesQuery.data && invoicesQuery.data.length > 0 ? (
        <div className="overflow-hidden rounded-lg border border-border bg-card">
          <ScrollArea orientation="horizontal">
            <table className="w-full min-w-[700px] border-collapse text-left text-sm">
              <thead className="bg-secondary text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="border-b border-border px-4 py-3">No. Invoice</th>
                  <th className="border-b border-border px-4 py-3">Nominal</th>
                  <th className="border-b border-border px-4 py-3">Tgl. Terbit</th>
                  <th className="border-b border-border px-4 py-3">Jatuh Tempo</th>
                  <th className="border-b border-border px-4 py-3">Status</th>
                  <th className="border-b border-border px-4 py-3">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {invoicesQuery.data.map((inv) => {
                  const documentUrl = inv.documentUrl ? resolveAssetUrl(inv.documentUrl) : "";

                  return (
                    <tr
                      key={inv.id}
                      className="align-middle transition-colors hover:bg-secondary/40"
                    >
                      <td className="border-b border-border px-4 py-3 font-semibold text-foreground">
                        {inv.invoiceNumber}
                      </td>
                      <td className="border-b border-border px-4 py-3 font-semibold text-foreground">
                        {formatCurrency(inv.amount)}
                      </td>
                      <td className="border-b border-border px-4 py-3 text-muted-foreground">
                        {inv.issueDate}
                      </td>
                      <td className="border-b border-border px-4 py-3 text-muted-foreground">
                        {inv.dueDate}
                      </td>
                      <td className="border-b border-border px-4 py-3">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold uppercase ${
                            inv.status === "paid"
                              ? "bg-teal-500/10 text-teal-600"
                              : inv.status === "waiting_payment"
                                ? "bg-amber-500/10 text-amber-600"
                                : inv.status === "overdue"
                                  ? "bg-destructive/10 text-destructive"
                                  : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {inv.status}
                        </span>
                      </td>
                      <td className="border-b border-border px-4 py-3">
                        {documentUrl ? (
                          <div className="flex gap-2">
                            <button
                              onClick={() => onPreviewPdf(documentUrl, `Invoice ${inv.invoiceNumber}`)}
                              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground hover:text-primary hover:bg-secondary cursor-pointer transition-colors"
                              title="Lihat"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <a
                              href={documentUrl}
                              download
                              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground hover:text-primary hover:bg-secondary cursor-pointer transition-colors"
                              title="Unduh"
                            >
                              <Download className="h-4 w-4" />
                            </a>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">No PDF</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </ScrollArea>
        </div>
      ) : (
        <p className="text-sm leading-6 text-muted-foreground">
          Belum ada invoice/billing yang diterbitkan untuk project ini.
        </p>
      )}
    </div>
  );
}
