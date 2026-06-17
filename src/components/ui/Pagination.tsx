"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/api";

interface PaginationProps {
  page: number;
  lastPage: number;
  onChange: (page: number) => void;
  className?: string;
}

export function Pagination({ page, lastPage, onChange, className }: PaginationProps) {
  if (lastPage <= 1) return null;

  const pages = getPageNumbers(page, lastPage);

  return (
    <div className={cn("flex items-center justify-center gap-1", className)}>
      <button
        onClick={() => onChange(page - 1)}
        disabled={page === 1}
        className="w-9 h-9 flex items-center justify-center rounded-lg border border-border text-text-secondary hover:text-text-primary hover:border-accent/40 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronLeft size={16} />
      </button>

      {pages.map((p, i) =>
        p === "..." ? (
          <span key={`dot-${i}`} className="w-9 h-9 flex items-center justify-center text-text-dim text-sm">
            …
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onChange(p as number)}
            className={cn(
              "w-9 h-9 flex items-center justify-center rounded-lg border text-sm font-medium transition-colors",
              p === page
                ? "bg-accent/20 border-accent/50 text-accent"
                : "border-border text-text-secondary hover:border-accent/40 hover:text-text-primary"
            )}
          >
            {p}
          </button>
        )
      )}

      <button
        onClick={() => onChange(page + 1)}
        disabled={page === lastPage}
        className="w-9 h-9 flex items-center justify-center rounded-lg border border-border text-text-secondary hover:text-text-primary hover:border-accent/40 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
}

function getPageNumbers(current: number, last: number): (number | "...")[] {
  if (last <= 7) return Array.from({ length: last }, (_, i) => i + 1);

  const pages: (number | "...")[] = [1];
  if (current > 3) pages.push("...");

  const start = Math.max(2, current - 1);
  const end = Math.min(last - 1, current + 1);
  for (let i = start; i <= end; i++) pages.push(i);

  if (current < last - 2) pages.push("...");
  pages.push(last);
  return pages;
}
