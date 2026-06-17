"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronLeft, ChevronRight, BookOpen, List, X,
  Settings, ArrowUp,
} from "lucide-react";
import { CommentsSection } from "@/components/comments/CommentsSection";
import { ReactionsBar } from "@/components/series/ReactionsBar";
import { useReadHistory } from "@/hooks/useReadHistory";
import { useUIStore } from "@/store";
import type { ChapterListItem } from "@/types";

interface ChapterReaderProps {
  slug: string;
  chapterIndex: number;       // numeric value, may be float e.g. 29.1
  chapterLabel?: string;      // original URL segment e.g. "29.1"
  seriesTitle: string;
  coverImage?: string;
  images: string[];
  prevChapter: number | null;
  nextChapter: number | null;
  allChapters: ChapterListItem[];
}

/** Format a chapter index for display/URL — keeps decimals only when needed */
function fmtChapter(n: number): string {
  // If it's a whole number, show without decimals
  return Number.isInteger(n) ? String(n) : String(n);
}

export function ChapterReader({
  slug,
  chapterIndex,
  chapterLabel,
  seriesTitle,
  coverImage,
  images,
  prevChapter,
  nextChapter,
  allChapters,
}: ChapterReaderProps) {
  const router = useRouter();
  const { record } = useReadHistory();
  const { readerWidth, setReaderWidth } = useUIStore();

  const [showBar, setShowBar] = useState(true);
  const [showList, setShowList] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const lastScrollY = useRef(0);

  const label = chapterLabel ?? fmtChapter(chapterIndex);

  // Record history on mount
  useEffect(() => {
    record({ slug, title: seriesTitle, chapter: chapterIndex, coverImage });
  }, [slug, chapterIndex, seriesTitle, coverImage, record]);

  // Scroll-aware top bar
  useEffect(() => {
    function onScroll() {
      const y = window.scrollY;
      setShowBar(y < 80 || y < lastScrollY.current);
      setShowScrollTop(y > 500);
      lastScrollY.current = y;
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === "ArrowLeft"  && prevChapter !== null)
        router.push(`/series/${slug}/${fmtChapter(prevChapter)}`);
      if (e.key === "ArrowRight" && nextChapter !== null)
        router.push(`/series/${slug}/${fmtChapter(nextChapter)}`);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [slug, prevChapter, nextChapter, router]);

  const widthClass =
    readerWidth === "narrow" ? "max-w-xl" :
    readerWidth === "wide"   ? "max-w-4xl" : "max-w-2xl";

  const sorted = [...allChapters].sort((a, b) => b.data.index - a.data.index);

  return (
    <div className="min-h-screen bg-[#0c0c0c]">

      {/* ── Top Bar ── */}
      <header
        className={`fixed top-0 inset-x-0 z-40 transition-transform duration-300 ${
          showBar ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <div className="bg-bg/95 backdrop-blur-xl border-b border-border flex items-center h-12 px-4 gap-3">
          {/* Back to series */}
          <Link
            href={`/series/${slug}`}
            className="flex items-center gap-1.5 text-text-secondary hover:text-text-primary transition-colors flex-shrink-0 min-w-0"
          >
            <ChevronLeft size={18} />
            <span className="text-sm hidden sm:block truncate max-w-[200px]">{seriesTitle}</span>
          </Link>

          <div className="flex-1 text-center">
            <span className="font-display font-bold text-sm text-text-primary">
              Chapter {label}
            </span>
          </div>

          <div className="flex items-center gap-1 flex-shrink-0">
            <button
              onClick={() => { setShowList(!showList); setShowSettings(false); }}
              className={`p-1.5 rounded-lg transition-colors ${
                showList
                  ? "text-accent bg-accent/10"
                  : "text-text-secondary hover:text-text-primary hover:bg-bg-elevated"
              }`}
              title="Chapter list"
            >
              <List size={16} />
            </button>
            <button
              onClick={() => { setShowSettings(!showSettings); setShowList(false); }}
              className={`p-1.5 rounded-lg transition-colors ${
                showSettings
                  ? "text-accent bg-accent/10"
                  : "text-text-secondary hover:text-text-primary hover:bg-bg-elevated"
              }`}
              title="Settings"
            >
              <Settings size={16} />
            </button>
          </div>
        </div>

        {/* Width settings strip */}
        {showSettings && (
          <div className="bg-bg-secondary border-b border-border px-4 py-2.5 flex items-center gap-4 animate-slide-down">
            <span className="text-xs text-text-muted">Page width:</span>
            {(["narrow", "normal", "wide"] as const).map((w) => (
              <button
                key={w}
                onClick={() => setReaderWidth(w)}
                className={`text-xs px-3 py-1 rounded border capitalize transition-colors ${
                  readerWidth === w
                    ? "bg-accent/20 border-accent/50 text-accent"
                    : "border-border text-text-secondary hover:border-accent/40"
                }`}
              >
                {w}
              </button>
            ))}
          </div>
        )}
      </header>

      {/* ── Chapter List Drawer ── */}
      {showList && (
        <>
          <div
            className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
            onClick={() => setShowList(false)}
          />
          <aside className="fixed right-0 top-0 bottom-0 w-64 bg-bg-secondary border-l border-border z-50 flex flex-col shadow-card-hover">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border flex-shrink-0">
              <span className="font-display font-bold text-sm text-text-primary">All Chapters</span>
              <button onClick={() => setShowList(false)} className="text-text-muted hover:text-text-primary">
                <X size={16} />
              </button>
            </div>
            <div className="overflow-y-auto flex-1">
              {sorted.map((ch) => {
                const isActive = Math.abs(ch.data.index - chapterIndex) < 0.001;
                return (
                  <Link
                    key={ch.id}
                    href={`/series/${slug}/${fmtChapter(ch.data.index)}`}
                    onClick={() => setShowList(false)}
                    className={`flex items-center justify-between px-4 py-2.5 text-sm hover:bg-bg-elevated transition-colors ${
                      isActive
                        ? "text-accent bg-accent/5 font-semibold"
                        : "text-text-secondary"
                    }`}
                  >
                    <span>Chapter {fmtChapter(ch.data.index)}</span>
                    {isActive && <span className="w-1.5 h-1.5 rounded-full bg-accent" />}
                  </Link>
                );
              })}
            </div>
          </aside>
        </>
      )}

      {/* ── Images ── */}
      <div className="pt-12">
        <div className={`mx-auto ${widthClass}`}>
          {images.length === 0 ? (
            <div className="flex items-center justify-center h-64 text-text-muted">
              No images available for this chapter.
            </div>
          ) : (
            images.map((url, i) => (
              <img
                key={i}
                src={url}
                alt={`Page ${i + 1}`}
                className="w-full block"
                loading={i < 3 ? "eager" : "lazy"}
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            ))
          )}
        </div>

        {/* ── Bottom Controls ── */}
        <div className={`mx-auto ${widthClass} px-4 pt-6 pb-12 space-y-6`}>

          {/* Prev / Series link / Next */}
          <div className="flex items-center justify-between gap-3">
            {prevChapter !== null ? (
              <Link
                href={`/series/${slug}/${fmtChapter(prevChapter)}`}
                className="flex items-center gap-2 px-4 py-2.5 bg-bg-elevated border border-border rounded-xl text-sm font-medium text-text-secondary hover:text-text-primary hover:border-accent/40 transition-all"
              >
                <ChevronLeft size={16} /> Ch.{fmtChapter(prevChapter)}
              </Link>
            ) : <div />}

            <Link
              href={`/series/${slug}`}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-bg-elevated border border-border rounded-xl text-sm text-text-muted hover:text-text-primary transition-colors"
            >
              <BookOpen size={14} /> Series
            </Link>

            {nextChapter !== null ? (
              <Link
                href={`/series/${slug}/${fmtChapter(nextChapter)}`}
                className="flex items-center gap-2 px-4 py-2.5 bg-accent hover:bg-accent-hover border border-accent rounded-xl text-sm font-semibold text-white transition-all"
              >
                Ch.{fmtChapter(nextChapter)} <ChevronRight size={16} />
              </Link>
            ) : <div />}
          </div>

          {/* Reactions */}
          <div className="p-4 bg-bg-card border border-border rounded-xl">
            <ReactionsBar slug={slug} chapterIndex={chapterIndex} />
          </div>

          {/* Comments */}
          <CommentsSection slug={slug} chapterIndex={chapterIndex} />
        </div>
      </div>

      {/* ── Scroll to Top FAB ── */}
      {showScrollTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-6 right-6 w-10 h-10 rounded-full bg-accent text-white flex items-center justify-center shadow-glow hover:bg-accent-hover transition-colors z-30"
        >
          <ArrowUp size={18} />
        </button>
      )}
    </div>
  );
}
