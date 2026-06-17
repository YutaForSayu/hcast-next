/**
 * HCast API client
 *
 * Strategy:
 * - SERVER (Next.js Server Components, Route Handlers):
 *   Calls upstream directly via `serverFetch()`, which injects session+XSRF.
 *   No HTTP hop through /api/proxy — avoids localhost self-calls on Vercel.
 *
 * - CLIENT (browser, "use client" components):
 *   Calls our own /api/proxy/... route, which handles session injection.
 *   Relative URL, so it always points to the running Next.js server.
 */

import { getUpstreamSession, UPSTREAM, BROWSER_HEADERS } from "./upstream-session";

const IS_SERVER = typeof window === "undefined";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  status: number;
  message: string;
  data: T;
  meta?: {
    total: number;
    page: number;
    lastPage: number;
    take?: number;
  };
}

export interface SeriesData {
  id: number;
  data: {
    slug: string;
    type?: string;
    isHot?: boolean;
    title: string;
    author?: string;
    nativeTitle?: string;
    format: string;
    rating: number;
    status?: string;
    releaseDate?: string;
    totalChapters?: string;
    synopsis?: string;
    coverImage?: string;
    backgroundImage?: string;
    isBanner?: boolean;
    bannerIndex?: number;
    animeAdaptation?: boolean;
    animeStatus?: string | null;
    genres?: { id: number; data: { name: string } }[];
  };
  dataMetadata?: {
    ranking?: number;
    dailyViews?: number;
    weeklyViews?: number;
    monthlyViews?: number;
    bookmarkCount?: number;
    totalViewsComputed?: number;
  };
  chapters?: { chapterIndex: number; createdAt: string }[];
  metadata?: {
    views?: { analytics: number; history: number; total: number };
    bookmarkCount?: number;
    ranking?: number;
  };
  weightedScore?: string;
  priorityScore?: number;
}

export interface ChapterData {
  id: number;
  seriesId: number;
  chapterIndex: number;
  isDraft: boolean;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
  data: {
    slug: string | null;
    title: string | null;
    thumbnail: string | null;
    totalViews: number;
    images: string[];
  };
  views: { analytics: number; history: number; total: number };
}

export interface ChapterListItem {
  id: number;
  createdAt: string;
  updatedAt: string;
  data: {
    slug: string | null;
    title: string | null;
    index: number;
    isDraft: boolean;
    seriesId: number;
    thumbnail: string | null;
  };
  isRead: boolean;
  views: { analytics: number; history: number; total: number };
}

export interface Genre {
  id: number;
  data: { name: string };
  createdAt?: string;
  updatedAt?: string;
}

// ─── Server-side fetch (direct to upstream with session) ──────────────────────

async function serverFetch<T>(
  path: string,
  opts?: { revalidate?: number }
): Promise<ApiResponse<T>> {
  const session = await getUpstreamSession();
  const url = `${UPSTREAM}/${path.replace(/^\//, "")}`;

  const headers: Record<string, string> = { ...BROWSER_HEADERS };
  if (session.cookieHeader) headers["Cookie"]       = session.cookieHeader;
  if (session.xsrfToken)    headers["X-XSRF-TOKEN"] = session.xsrfToken;

  const res = await fetch(url, {
    headers,
    cache: "no-store",
    next:  opts?.revalidate !== undefined ? { revalidate: opts.revalidate } : { revalidate: 300 },
  });

  if (!res.ok) throw new Error(`Upstream ${res.status} for ${path}`);
  return res.json();
}

// ─── Client-side fetch (through /api/proxy) ───────────────────────────────────

async function clientFetch<T>(path: string): Promise<ApiResponse<T>> {
  const url = `/api/proxy/${path.replace(/^\//, "")}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`Proxy ${res.status} for ${path}`);
  return res.json();
}

// ─── Unified fetch ────────────────────────────────────────────────────────────

function apiFetch<T>(
  path: string,
  opts?: { revalidate?: number }
): Promise<ApiResponse<T>> {
  return IS_SERVER ? serverFetch<T>(path, opts) : clientFetch<T>(path);
}

// ─── API surface ──────────────────────────────────────────────────────────────

export const api = {
  getBanners: () =>
    apiFetch<SeriesData[]>("banners"),

  getTrending: (take = 10) =>
    apiFetch<SeriesData[]>(`series/trending?take=${take}`),

  getPopular: (take = 12, take_chapter = 2) =>
    apiFetch<SeriesData[]>(`series/popular?take=${take}&take_chapter=${take_chapter}`),

  getLatest: (page = 1, take = 20, type?: string) =>
    apiFetch<SeriesData[]>(
      `series/latest?take=${take}&take_chapter=3&page=${page}${type ? `&type=${type}` : ""}`
    ),

  browse: (params: {
    page?: number; take?: number; status?: string; format?: string;
    genre_ids?: string; sort?: string; sort_order?: string; sq?: string; type?: string;
  }) => {
    const q = new URLSearchParams({ take_chapter: "2" });
    if (params.page)       q.set("page",       String(params.page));
    if (params.take)       q.set("take",       String(params.take));
    if (params.status)     q.set("status",     params.status);
    if (params.format)     q.set("format",     params.format);
    if (params.genre_ids)  q.set("genre_ids",  params.genre_ids);
    if (params.sort)       q.set("sort",       params.sort);
    if (params.sort_order) q.set("sort_order", params.sort_order);
    if (params.sq)         q.set("sq",         params.sq);
    if (params.type)       q.set("type",       params.type);
    return apiFetch<SeriesData[]>(`series/browse?${q}`);
  },

  search: (q: string, page = 1, take = 12) =>
    apiFetch<SeriesData[]>(
      `series/search?q=${encodeURIComponent(q)}&take=${take}&page=${page}&take_chapter=2`
    ),

  getGenres: () =>
    apiFetch<Genre[]>("genres"),

  getSeriesDetail: (slug: string) =>
    apiFetch<SeriesData>(`series/${slug}`),

  getSeriesChapters: (slug: string) =>
    apiFetch<ChapterListItem[]>(`series/${slug}/chapters`),

  getChapterDetail: (slug: string, index: number) =>
    apiFetch<ChapterData>(`series/${slug}/chapters/${index}`, { revalidate: 0 }),

  getTopManhwa: (take = 10, page = 1) =>
    apiFetch<SeriesData[]>(`series/top/manhwa?take=${take}&page=${page}`),

  getTopManhua: (take = 10, page = 1) =>
    apiFetch<SeriesData[]>(`series/top/manhua?take=${take}&page=${page}`),

  getTopManga: (take = 10, page = 1) =>
    apiFetch<SeriesData[]>(`series/top/manga?take=${take}&page=${page}`),

  getRecommendations: (take = 10, page = 1) =>
    apiFetch<SeriesData[]>(`series/recommendations?take=${take}&page=${page}`),
};

// ─── Image proxy ──────────────────────────────────────────────────────────────

export function getProxiedImage(url: string, slug: string, chapter?: number): string {
  if (!url) return "";
  const base = process.env.NEXT_PUBLIC_IMG_PROXY ?? "https://prox.kcast.eu.cc/prox";
  const referer = chapter
    ? `https://v2.komikcast.fit/series/${slug}/chapters/${chapter}`
    : `https://v2.komikcast.fit/series/${slug}/`;
  return (
    `${base}?u=${encodeURIComponent(url)}` +
    `&referer=${encodeURIComponent(referer)}` +
    `&origin=https://v2.komikcast.fit` +
    `&accept=*/*` +
    `&ua=Mozilla/5.0`
  );
}

// ─── Formatting helpers ───────────────────────────────────────────────────────

export function formatNumber(n?: number): string {
  if (!n) return "0";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now   = new Date();
  const diff  = now.getTime() - date.getTime();
  const mins  = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days  = Math.floor(diff / 86_400_000);

  if (mins  < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days  < 7)  return `${days}d ago`;
  if (days  < 30) return `${Math.floor(days / 7)}w ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function formatStatus(status?: string): string {
  if (!status) return "";
  return status.charAt(0).toUpperCase() + status.slice(1);
}

export function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(" ");
}
