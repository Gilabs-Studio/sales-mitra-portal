"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

type PaginationProps = {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
};

function buildPageRange(current: number, total: number): (number | "...")[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  const pages: (number | "...")[] = [1];
  if (current > 3) pages.push("...");
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  for (let i = start; i <= end; i++) pages.push(i);
  if (current < total - 2) pages.push("...");
  pages.push(total);
  return pages;
}

export function Pagination({ page, totalPages, onPageChange, className }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = buildPageRange(page, totalPages);

  const btnBase =
    "inline-flex h-8 min-w-8 cursor-pointer items-center justify-center rounded-lg border px-2 text-sm font-medium transition-all duration-200 select-none";

  return (
    <nav
      role="navigation"
      aria-label="Navigasi halaman"
      className={cn("flex items-center gap-1", className)}
    >
      {/* Prev */}
      <button
        type="button"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
        aria-label="Halaman sebelumnya"
        className={cn(
          btnBase,
          "border-border bg-card text-foreground",
          page <= 1
            ? "cursor-not-allowed opacity-40"
            : "hover:-translate-y-0.5 hover:border-primary hover:bg-primary/10 hover:text-primary active:translate-y-0",
        )}
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      {/* Page numbers */}
      {pages.map((p, idx) =>
        p === "..." ? (
          <span key={`ellipsis-${idx}`} className="px-1 text-sm text-muted-foreground select-none">
            …
          </span>
        ) : (
          <button
            key={p}
            type="button"
            onClick={() => onPageChange(p)}
            aria-label={`Halaman ${p}`}
            aria-current={p === page ? "page" : undefined}
            className={cn(
              btnBase,
              p === page
                ? "border-primary bg-primary text-primary-foreground shadow-sm shadow-primary/30"
                : "border-border bg-card text-foreground hover:-translate-y-0.5 hover:border-primary hover:bg-primary/10 hover:text-primary active:translate-y-0",
            )}
          >
            {p}
          </button>
        ),
      )}

      {/* Next */}
      <button
        type="button"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
        aria-label="Halaman berikutnya"
        className={cn(
          btnBase,
          "border-border bg-card text-foreground",
          page >= totalPages
            ? "cursor-not-allowed opacity-40"
            : "hover:-translate-y-0.5 hover:border-primary hover:bg-primary/10 hover:text-primary active:translate-y-0",
        )}
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </nav>
  );
}
