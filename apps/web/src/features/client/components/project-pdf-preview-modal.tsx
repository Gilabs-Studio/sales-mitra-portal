"use client";

type ProjectPdfPreviewModalProps = {
  title: string;
  url: string;
  onClose: () => void;
};

export function ProjectPdfPreviewModal({
  title,
  url,
  onClose,
}: ProjectPdfPreviewModalProps) {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col justify-between bg-black/60 p-4">
      <div className="flex items-center justify-between rounded-t-lg border-b border-border bg-card p-3 shadow">
        <h3 className="text-sm font-extrabold text-foreground">{title}</h3>
        <div className="flex gap-2">
          <a
            href={url}
            download
            className="inline-flex min-h-8 items-center justify-center rounded bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground transition-all hover:-translate-y-0.5 cursor-pointer"
          >
            Unduh
          </a>
          <button
            onClick={onClose}
            className="inline-flex min-h-8 items-center justify-center rounded bg-secondary px-3 py-1.5 text-xs font-bold text-foreground hover:bg-border transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
      <div className="relative flex-1 overflow-hidden bg-card shadow-2xl">
        <iframe
          src={url}
          className="h-full w-full border-0"
          title="PDF Handover Viewer"
        />
      </div>
    </div>
  );
}
