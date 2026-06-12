"use client";

import * as React from "react";
import { uploadFile } from "@/features/admin/services/admin.service";

type FileUploadProps = {
  value: string;
  onChange: (url: string) => void;
  accept?: string;
  disabled?: boolean;
  uploadContext?: {
    category?: string;
    clientId?: string;
    projectId?: string;
  };
};

export function FileUpload({
  value,
  onChange,
  accept = ".pdf",
  disabled = false,
  uploadContext,
}: FileUploadProps) {
  const [isUploading, setIsUploading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    await processFile(files[0]);
  };

  const processFile = async (file: File) => {
    setIsUploading(true);
    setError(null);
    try {
      const result = await uploadFile(file, uploadContext);
      onChange(result.url);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Gagal mengunggah file. Silakan coba kembali.");
    } finally {
      setIsUploading(false);
    }
  };

  const triggerSelect = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-2">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept={accept}
        className="hidden"
        disabled={disabled || isUploading}
      />
      <div
        onClick={!disabled && !isUploading ? triggerSelect : undefined}
        className={`flex min-h-12 w-full cursor-pointer items-center justify-between rounded-lg border border-dashed border-input bg-muted px-4 py-2 text-sm transition-all duration-300 hover:border-primary ${
          disabled ? "cursor-not-allowed opacity-60" : ""
        }`}
      >
        <div className="flex-1 pr-4 truncate">
          {isUploading ? (
            <span className="text-muted-foreground animate-pulse">Mengunggah...</span>
          ) : value ? (
            <span className="font-mono text-xs text-foreground truncate block">{value}</span>
          ) : (
            <span className="text-muted-foreground">Pilih file PDF untuk diunggah</span>
          )}
        </div>
        <button
          type="button"
          disabled={disabled || isUploading}
          className="shrink-0 rounded bg-primary px-3 py-1 text-xs font-bold text-primary-foreground transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 disabled:pointer-events-none"
        >
          Pilih File
        </button>
      </div>
      {error && <p className="text-xs font-bold text-destructive">{error}</p>}
    </div>
  );
}
