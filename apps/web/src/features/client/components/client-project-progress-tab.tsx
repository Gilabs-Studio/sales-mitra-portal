"use client";

import { Download, Eye } from "lucide-react";
import { useProjectProgress } from "../hooks/use-client";
import { resolveAssetUrl } from "@/lib/asset-url";

type ClientProjectProgressTabProps = {
  projectId: string;
  onPreviewPdf: (url: string, title: string) => void;
};

export function ClientProjectProgressTab({
  projectId,
  onPreviewPdf,
}: ClientProjectProgressTabProps) {
  const progressQuery = useProjectProgress(projectId);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-extrabold text-foreground">
        Timeline Milestone Progres
      </h3>
      <div className="relative ml-4 space-y-6 border-l border-border pl-6">
        {progressQuery.isLoading ? (
          <div className="h-32 animate-pulse rounded-md bg-muted" />
        ) : progressQuery.data && progressQuery.data.length > 0 ? (
          progressQuery.data.map((prog) => {
            const documentUrl = prog.documentUrl ? resolveAssetUrl(prog.documentUrl) : null;

            return (
              <div key={prog.id} className="relative">
                <span
                  className={`absolute -left-[31px] top-1.5 flex h-4 w-4 items-center justify-center rounded-full ring-4 ring-card ${
                    prog.status === "completed"
                      ? "bg-primary text-white"
                      : prog.status === "in_progress"
                        ? "bg-cyan-500 text-white"
                        : "bg-border text-muted-foreground"
                  }`}
                />
                <div className="rounded-lg border border-border bg-card p-4 transition-all hover:shadow-sm">
                  <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                    <div>
                      <h4 className="text-sm font-extrabold text-foreground">
                        {prog.title}
                      </h4>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        Tanggal update: {prog.updateDate}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-extrabold text-primary">
                        {prog.percentage}%
                      </span>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${
                          prog.status === "completed"
                            ? "bg-primary/10 text-primary"
                            : prog.status === "in_progress"
                              ? "bg-cyan-500/10 text-cyan-500"
                              : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {prog.status}
                      </span>
                    </div>
                  </div>
                  {prog.notes && (
                    <p className="mt-3 rounded border border-border/40 bg-secondary/50 p-2.5 text-xs leading-relaxed text-muted-foreground">
                      {prog.notes}
                    </p>
                  )}
                  {documentUrl && (
                    <div className="mt-3 flex gap-2">
                      <button
                        onClick={() => onPreviewPdf(documentUrl, prog.title)}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground hover:text-primary hover:bg-secondary cursor-pointer transition-colors"
                        title="Lihat PDF"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <a
                        href={documentUrl}
                        download
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground hover:text-primary hover:bg-secondary cursor-pointer transition-colors"
                        title="Unduh PDF"
                      >
                        <Download className="h-4 w-4" />
                      </a>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <p className="text-sm leading-6 text-muted-foreground">
            Belum ada progres timeline yang diupdate oleh admin.
          </p>
        )}
      </div>
    </div>
  );
}
