"use client";

import Image from "next/image";
import Link from "next/link";
import { Bookmark, BookmarkX, Trash2 } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { useBookmarks } from "@/hooks/useBookmarks";
import { EmptyState } from "@/components/ui/EmptyState";
import { SeriesGridSkeleton } from "@/components/ui/Skeletons";

export default function SavedPage() {
  const { user } = useAuth();
  const { bookmarks, loading, toggle } = useBookmarks();

  if (!user) {
    return (
      <div className="hcast-container py-16">
        <EmptyState
          icon={Bookmark}
          title="Not signed in"
          description="Please login to see your saved series"
          action={{ label: "Login", href: "/login" }}
        />
      </div>
    );
  }

  return (
    <div className="hcast-container py-8">
      <div className="flex items-center gap-3 mb-6">
        <Bookmark size={20} className="text-accent" />
        <h1 className="font-display text-2xl font-bold text-text-primary">Saved Series</h1>
        {bookmarks.length > 0 && (
          <span className="text-text-muted text-sm">({bookmarks.length})</span>
        )}
      </div>

      {loading ? (
        <SeriesGridSkeleton count={10} />
      ) : bookmarks.length === 0 ? (
        <EmptyState
          icon={BookmarkX}
          title="No bookmarks yet"
          description="Save series you like to read them later"
          action={{ label: "Browse Series", href: "/browse" }}
        />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {bookmarks.map((item) => (
            <div key={item.id} className="group relative">
              <Link href={`/series/${item.seriesSlug}`}>
                <div className="relative aspect-[3/4] rounded-xl overflow-hidden border border-border/50 group-hover:border-accent/40 transition-colors bg-bg-card">
                  {item.coverImage ? (
                    <Image
                      src={item.coverImage}
                      alt={item.seriesTitle}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      unoptimized
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Bookmark size={24} className="text-text-dim" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                </div>
                <p className="mt-2 text-xs font-semibold text-text-primary group-hover:text-accent transition-colors line-clamp-2 leading-snug">
                  {item.seriesTitle}
                </p>
              </Link>

              {/* Remove button */}
              <button
                onClick={() => toggle(item.seriesSlug, item.seriesTitle, item.coverImage ?? undefined)}
                title="Remove bookmark"
                className="absolute top-1.5 right-1.5 w-7 h-7 rounded-full bg-black/70 border border-white/10 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600/80"
              >
                <Trash2 size={12} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
