"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, Filter, X, ChevronDown, Grid3X3, List } from "lucide-react";
import { api } from "@/lib/api";
import type { SeriesData, Genre } from "@/lib/api";
import { SeriesCard } from "@/components/series/SeriesCard";
import { SeriesListItem } from "@/components/series/SeriesListItem";

const FORMATS = ["manga", "manhwa", "manhua", "mangatoon"];
const STATUSES = ["ongoing", "completed", "hiatus", "cancelled"];
const SORTS = [
  { value: "latest", label: "Latest" },
  { value: "popularity", label: "Popular" },
  { value: "rating", label: "Rating" },
];

export function BrowseClient({ genres, initialParams }: { genres: Genre[]; initialParams: Record<string, string> }) {
  const router = useRouter();
  const [search, setSearch] = useState(initialParams.q || "");
  const [format, setFormat] = useState(initialParams.format || "");
  const [status, setStatus] = useState(initialParams.status || "");
  const [sort, setSort] = useState(initialParams.sort || "latest");
  const [selectedGenres, setSelectedGenres] = useState<number[]>(
    initialParams.genre_ids ? initialParams.genre_ids.split(",").map(Number) : []
  );
  const [page, setPage] = useState(1);
  const [series, setSeries] = useState<SeriesData[]>([]);
  const [meta, setMeta] = useState<{ total: number; lastPage: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const fetchSeries = useCallback(async (p: number, replace = false) => {
    setLoading(true);
    try {
      const res = await api.browse({
        page: p, take: 24, sort, status: status || undefined, format: format || undefined,
        genre_ids: selectedGenres.length ? selectedGenres.join(",") : undefined,
        sq: search.trim() || undefined,
      });
      setSeries(prev => replace ? res.data : [...prev, ...res.data]);
      setMeta(res.meta ? { total: res.meta.total, lastPage: res.meta.lastPage } : null);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, [search, format, status, sort, selectedGenres]);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => { setPage(1); fetchSeries(1, true); }, 400);
  }, [search, format, status, sort, selectedGenres]);

  function toggleGenre(id: number) {
    setSelectedGenres(prev => prev.includes(id) ? prev.filter(g => g !== id) : [...prev, id]);
  }

  function clearFilters() {
    setSearch(""); setFormat(""); setStatus(""); setSelectedGenres([]); setSort("latest");
  }

  const hasFilters = search || format || status || selectedGenres.length > 0 || sort !== "latest";

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
        <h1 className="font-display text-2xl font-bold text-text-primary">Browse Series</h1>
        {meta && <span className="text-text-muted text-sm">{meta.total.toLocaleString()} series</span>}
        <div className="flex items-center gap-2 ml-auto">
          <button onClick={() => setView("grid")} className={`p-1.5 rounded-lg transition-colors ${view === "grid" ? "text-accent bg-accent/10" : "text-text-muted hover:text-text-primary"}`}>
            <Grid3X3 size={16} />
          </button>
          <button onClick={() => setView("list")} className={`p-1.5 rounded-lg transition-colors ${view === "list" ? "text-accent bg-accent/10" : "text-text-muted hover:text-text-primary"}`}>
            <List size={16} />
          </button>
        </div>
      </div>

      {/* Search & Filter bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search series..."
            className="input-field pl-9" />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary">
              <X size={14} />
            </button>
          )}
        </div>
        <button onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium transition-colors ${showFilters || hasFilters ? "bg-accent/10 border-accent/40 text-accent" : "bg-bg-elevated border-border text-text-secondary hover:border-accent/40"}`}>
          <Filter size={14} />
          Filters
          {hasFilters && <span className="w-4 h-4 rounded-full bg-accent text-white text-[10px] flex items-center justify-center">{[format, status, ...selectedGenres.map(String)].filter(Boolean).length}</span>}
          <ChevronDown size={14} className={`transition-transform ${showFilters ? "rotate-180" : ""}`} />
        </button>
        <select value={sort} onChange={e => setSort(e.target.value)}
          className="input-field w-auto pl-3 pr-8 py-2.5 text-sm appearance-none cursor-pointer">
          {SORTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div className="bg-bg-card border border-border rounded-xl p-4 mb-4 space-y-4 animate-slide-down">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-text-primary">Filters</span>
            {hasFilters && <button onClick={clearFilters} className="text-xs text-red-400 hover:text-red-300 transition-colors">Clear all</button>}
          </div>

          <div>
            <p className="text-xs text-text-muted mb-2 uppercase tracking-wider">Format</p>
            <div className="flex flex-wrap gap-2">
              {FORMATS.map(f => (
                <button key={f} onClick={() => setFormat(format === f ? "" : f)}
                  className={`px-3 py-1.5 rounded-lg border text-sm capitalize transition-colors ${format === f ? "bg-accent/20 border-accent/50 text-accent" : "border-border text-text-secondary hover:border-accent/40"}`}>
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs text-text-muted mb-2 uppercase tracking-wider">Status</p>
            <div className="flex flex-wrap gap-2">
              {STATUSES.map(s => (
                <button key={s} onClick={() => setStatus(status === s ? "" : s)}
                  className={`px-3 py-1.5 rounded-lg border text-sm capitalize transition-colors ${status === s ? "bg-accent/20 border-accent/50 text-accent" : "border-border text-text-secondary hover:border-accent/40"}`}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs text-text-muted mb-2 uppercase tracking-wider">Genres</p>
            <div className="flex flex-wrap gap-1.5">
              {genres.sort((a, b) => a.data.name.localeCompare(b.data.name)).map(g => (
                <button key={g.id} onClick={() => toggleGenre(g.id)}
                  className={`px-2.5 py-1 rounded-full border text-xs transition-colors ${selectedGenres.includes(g.id) ? "bg-accent/20 border-accent/50 text-accent" : "border-border text-text-secondary hover:border-accent/40"}`}>
                  {g.data.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      {loading && series.length === 0 ? (
        <div className={view === "grid" ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3" : "space-y-2"}>
          {Array.from({ length: 24 }).map((_, i) => (
            <div key={i} className={`skeleton rounded-xl ${view === "grid" ? "aspect-[3/4]" : "h-20"}`} />
          ))}
        </div>
      ) : series.length === 0 ? (
        <div className="text-center py-16 text-text-muted">
          <Search size={40} className="mx-auto mb-3 opacity-30" />
          <p>No series found</p>
          {hasFilters && <button onClick={clearFilters} className="mt-2 text-accent text-sm hover:underline">Clear filters</button>}
        </div>
      ) : (
        <>
          {view === "grid" ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
              {series.map(s => <SeriesCard key={s.id} series={s} showChapters={true} />)}
            </div>
          ) : (
            <div className="space-y-2">
              {series.map(s => <SeriesListItem key={s.id} series={s} />)}
            </div>
          )}

          {meta && page < meta.lastPage && (
            <div className="mt-8 text-center">
              <button onClick={() => { const next = page + 1; setPage(next); fetchSeries(next); }}
                disabled={loading}
                className="btn-secondary px-8 py-2.5 disabled:opacity-50">
                {loading ? "Loading..." : "Load More"}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
