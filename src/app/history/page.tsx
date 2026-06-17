"use client";
import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Clock, BookOpen, Trash2, X } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { useReadHistory } from "@/hooks/useReadHistory";
import { formatDate } from "@/lib/api";

export default function HistoryPage() {
  const { user } = useAuth();
  const { history, remove, clear } = useReadHistory();

  if (!user) return (
    <div className="hcast-container py-16 text-center">
      <Clock size={40} className="mx-auto mb-4 text-text-dim" />
      <p className="text-text-secondary mb-4">Please login to see your reading history</p>
      <Link href="/login" className="btn-primary inline-flex">Login</Link>
    </div>
  );

  return (
    <div className="hcast-container py-8 max-w-3xl">
      <div className="flex items-center gap-3 mb-6">
        <Clock size={20} className="text-accent" />
        <h1 className="font-display text-2xl font-bold text-text-primary">Reading History</h1>
        {history.length > 0 && (
          <span className="text-text-muted text-sm ml-1">({history.length})</span>
        )}
        {history.length > 0 && (
          <button
            onClick={clear}
            className="ml-auto flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 transition-colors"
          >
            <Trash2 size={13} /> Clear all
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <div className="text-center py-16">
          <BookOpen size={48} className="mx-auto mb-4 text-text-dim" />
          <p className="text-text-secondary">No reading history yet</p>
          <Link href="/browse" className="mt-3 inline-flex text-accent hover:underline text-sm">
            Start reading →
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {history.map((item, i) => (
            <div
              key={`${item.slug}-${item.chapter}-${i}`}
              className="flex items-center gap-3 p-3 bg-bg-card border border-border/50 rounded-xl group hover:border-accent/30 transition-colors"
            >
              {/* Cover */}
              {item.coverImage && (
                <Link href={`/series/${item.slug}/${item.chapter}`} className="flex-shrink-0">
                  <div className="relative w-10 h-14 rounded-lg overflow-hidden">
                    <Image
                      src={item.coverImage}
                      alt={item.title}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                </Link>
              )}

              {/* Info */}
              <div className="flex-1 min-w-0">
                <Link href={`/series/${item.slug}`}>
                  <p className="text-sm font-semibold text-text-primary group-hover:text-accent transition-colors truncate">
                    {item.title || item.slug}
                  </p>
                </Link>
                <Link
                  href={`/series/${item.slug}/${item.chapter}`}
                  className="text-xs text-accent hover:text-accent-hover transition-colors"
                >
                  Chapter {item.chapter}
                </Link>
              </div>

              {/* Time */}
              <span className="text-xs text-text-muted flex-shrink-0">
                {item.time ? formatDate(item.time) : ""}
              </span>

              {/* Remove */}
              <button
                onClick={() => remove(item.slug, item.chapter)}
                className="p-1 text-text-dim hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 flex-shrink-0"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
