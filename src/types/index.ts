// Re-export API types for convenience
export type { SeriesData, ChapterData, ChapterListItem, Genre } from "@/lib/api";

// ─── App-specific types ───────────────────────────────────────────────────────

export type ReactionType = "like" | "funny" | "nice" | "sad" | "angry" | "fire" | "mykisah" | "gokil" | "love" | "moai";

export interface ReactionTotals {
  like: number;
  funny: number;
  nice: number;
  sad: number;
  angry: number;
  fire: number;
  mykisah: number;
  gokil: number;
  love: number;
  moai: number;
}

export interface ReactionsData {
  totals: ReactionTotals;
  userReaction: ReactionType | null;
}

export interface HistoryEntry {
  slug: string;
  title: string;
  chapter: number;
  coverImage?: string;
  time: string;
}

export type ViewMode = "grid" | "list";
export type ImageWidth = "narrow" | "normal" | "wide";
export type SortOption = "latest" | "popularity" | "rating";

export interface BrowseParams {
  page?: number;
  take?: number;
  status?: string;
  format?: string;
  genre_ids?: string;
  sort?: string;
  sort_order?: string;
  sq?: string;
  type?: string;
}
