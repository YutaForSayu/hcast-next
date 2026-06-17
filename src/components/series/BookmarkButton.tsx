"use client";
import { useBookmarks } from "@/hooks/useBookmarks";
import { Bookmark, BookmarkCheck } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/components/auth/AuthProvider";

interface BookmarkButtonProps {
  slug: string;
  title: string;
  coverImage?: string;
}

export function BookmarkButton({ slug, title, coverImage }: BookmarkButtonProps) {
  const { user } = useAuth();
  const { isBookmarked, toggle, loading } = useBookmarks();
  const saved = isBookmarked(slug);

  if (!user) {
    return (
      <Link href="/login" className="btn-secondary">
        <Bookmark size={16} /> Save
      </Link>
    );
  }

  return (
    <button
      onClick={() => toggle(slug, title, coverImage)}
      disabled={loading}
      className={`btn-secondary disabled:opacity-50 transition-all ${
        saved ? "text-accent border-accent/40 bg-accent/5" : ""
      }`}
    >
      {saved ? (
        <BookmarkCheck size={16} className="text-accent" />
      ) : (
        <Bookmark size={16} />
      )}
      {saved ? "Saved" : "Save"}
    </button>
  );
}
