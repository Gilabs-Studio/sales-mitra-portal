"use client";

import { Download, Eye } from "lucide-react";
import { useProjectDocuments } from "../hooks/use-client";
import type { Project } from "../types/client.types";
import { formatDate } from "@/lib/utils";
import { resolveAssetUrl } from "@/lib/asset-url";

type ClientProjectDeliverablesTabProps = {
  projectId: string;
  project?: Project;
  onPreviewPdf: (url: string, title: string) => void;
};

export function ClientProjectDeliverablesTab({
  projectId,
  project,
  onPreviewPdf,
}: ClientProjectDeliverablesTabProps) {
  const docsQuery = useProjectDocuments(projectId);

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-border bg-card p-5">
        <h3 className="mb-4 text-md font-extrabold text-foreground">
          Informasi Deployment & Website
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          {project?.websiteUrl && (
            <div className="flex items-center justify-between rounded-lg border border-border bg-secondary p-4 transition-all hover:-translate-y-0.5">
              <div>
                <p className="text-xs text-muted-foreground">Website Utama (Production)</p>
                <h4 className="mt-1 line-clamp-1 text-sm font-extrabold text-foreground">
                  {project.websiteUrl}
                </h4>
              </div>
              <a
                href={project.websiteUrl}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-bold text-primary hover:underline cursor-pointer"
              >
                Buka Situs
              </a>
            </div>
          )}
          {project?.stagingUrl && (
            <div className="flex items-center justify-between rounded-lg border border-border bg-secondary p-4 transition-all hover:-translate-y-0.5">
              <div>
                <p className="text-xs text-muted-foreground">Staging / Development Website</p>
                <h4 className="mt-1 line-clamp-1 text-sm font-extrabold text-foreground">
                  {project.stagingUrl}
                </h4>
              </div>
              <a
                href={project.stagingUrl}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-bold text-primary hover:underline cursor-pointer"
              >
                Buka Situs
              </a>
            </div>
          )}
        </div>

        {project?.credentials && (
          <div className="mt-4 rounded-lg border border-border bg-secondary p-4">
            <h4 className="text-xs font-bold text-foreground">Informasi Akses & Credentials</h4>
            <pre className="mt-2 overflow-x-auto whitespace-pre-wrap rounded border border-border bg-card p-3 font-mono text-xs leading-relaxed text-muted-foreground">
              {project.credentials}
            </pre>
          </div>
        )}

        {project?.documentation && (
          <div className="mt-4 rounded-lg border border-border bg-secondary p-4">
            <h4 className="text-xs font-bold text-foreground">Dokumentasi Tambahan</h4>
            <p className="mt-1 whitespace-pre-line text-xs leading-relaxed text-muted-foreground">
              {project.documentation}
            </p>
          </div>
        )}
      </div>

      <div className="rounded-lg border border-border bg-card p-5">
        <h3 className="mb-4 text-md font-extrabold text-foreground">
          Dokumen Serah Terima & Manual
        </h3>
        {docsQuery.isLoading ? (
          <div className="h-32 animate-pulse rounded-md bg-muted" />
        ) : docsQuery.data && docsQuery.data.length > 0 ? (
          <div className="divide-y divide-border/60">
            {docsQuery.data.map((doc) => {
              const documentUrl = resolveAssetUrl(doc.documentUrl);

              return (
                <div
                  key={doc.id}
                  className="flex items-center justify-between rounded-md px-2 py-3.5 transition-colors hover:bg-secondary/20"
                >
                  <div>
                    <h4 className="text-sm font-bold text-foreground">{doc.title}</h4>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      Diunggah pada: {formatDate(doc.uploadedAt)}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => onPreviewPdf(documentUrl, doc.title)}
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
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm leading-6 text-muted-foreground">
            Belum ada dokumen deliverables/BAST yang diunggah oleh admin.
          </p>
        )}
      </div>
    </div>
  );
}
