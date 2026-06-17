"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import toast from "react-hot-toast";

interface BookmarkItem {
  id: number;
  userId: number;
  seriesSlug: string;
  seriesTitle: string;
  coverImage?: string | null;
  createdAt: string;
}

export function useBookmarks() {
  const { user } = useAuth();
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);

  const fetchBookmarks = useCallback(async () => {
    if (!user) { setBookmarks([]); setInitialized(true); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/bookmarks");
      const data = await res.json();
      setBookmarks(data.data || []);
    } catch {
      setBookmarks([]);
    } finally {
      setLoading(false);
      setInitialized(true);
    }
  }, [user]);

  useEffect(() => { fetchBookmarks(); }, [fetchBookmarks]);

  const isBookmarked = useCallback(
    (slug: string) => bookmarks.some((b) => b.seriesSlug === slug),
    [bookmarks]
  );

  const toggle = useCallback(
    async (slug: string, title: string, coverImage?: string) => {
      if (!user) { toast.error("Please login to bookmark"); return false; }

      const wasBookmarked = isBookmarked(slug);

      // Optimistic update
      if (wasBookmarked) {
        setBookmarks((prev) => prev.filter((b) => b.seriesSlug !== slug));
      } else {
        setBookmarks((prev) => [
          ...prev,
          {
            id: Date.now(),
            userId: user.userId,
            seriesSlug: slug,
            seriesTitle: title,
            coverImage,
            createdAt: new Date().toISOString(),
          },
        ]);
      }

      try {
        const res = await fetch("/api/bookmarks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ slug, title, coverImage }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        toast.success(data.bookmarked ? "Added to bookmarks" : "Removed from bookmarks");
        return data.bookmarked as boolean;
      } catch {
        fetchBookmarks(); // revert
        toast.error("Failed to update bookmark");
        return wasBookmarked;
      }
    },
    [user, isBookmarked, fetchBookmarks]
  );

  return { bookmarks, loading, initialized, isBookmarked, toggle, refetch: fetchBookmarks };
}
