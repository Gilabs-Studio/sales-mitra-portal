"use client";

import { useProjectReportData } from "../hooks/use-client";
import { formatDate } from "@/lib/utils";

type ClientProjectReportsTabProps = {
  projectId: string;
  onDownloadReport: () => void;
};

type ReportHistoryItem = {
  id: string;
  details: string;
  actorName: string;
  actorRole: string;
  createdAt: string;
};

export function ClientProjectReportsTab({
  projectId,
  onDownloadReport,
}: ClientProjectReportsTabProps) {
  const reportQuery = useProjectReportData(projectId);
  const historyItems = (reportQuery.data?.history ?? []) as ReportHistoryItem[];

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-border bg-card p-5">
        <h3 className="mb-2 text-md font-extrabold text-foreground">
          Laporan Perkembangan & Pemakaian Layanan
        </h3>
        <p className="mb-4 text-xs text-muted-foreground">
          Dapatkan rangkuman data progress, dokumen serah terima, penggunaan maintenance, dan riwayat tagihan invoice untuk kebutuhan pertanggungjawaban internal.
        </p>
        <button
          onClick={onDownloadReport}
          className="inline-flex min-h-10 items-center justify-center rounded-lg border border-primary bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
        >
          Cetak / Unduh Laporan Project
        </button>
      </div>

      <div className="rounded-lg border border-border bg-card p-5" id="printable-report">
        <h3 className="mb-4 text-md font-extrabold text-foreground">
          Log Aktivitas Transparansi Project
        </h3>
        {reportQuery.isLoading ? (
          <div className="h-32 animate-pulse rounded-md bg-muted" />
        ) : historyItems.length > 0 ? (
          <div className="space-y-3">
            {historyItems.map((history) => (
              <div
                key={history.id}
                className="flex justify-between gap-4 rounded-lg border border-border bg-secondary p-3 text-xs leading-relaxed text-muted-foreground"
              >
                <div>
                  <p className="font-bold text-foreground">{history.details}</p>
                  <p className="mt-0.5 text-[10px] text-muted-foreground">
                    Oleh: {history.actorName} ({history.actorRole})
                  </p>
                </div>
                <span className="whitespace-nowrap text-[10px]">
                  {formatDate(history.createdAt)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm leading-6 text-muted-foreground">
            Belum ada riwayat aktivitas yang tercatat.
          </p>
        )}
      </div>
    </div>
  );
}
