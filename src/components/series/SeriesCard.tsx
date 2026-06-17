import Link from "next/link";
import Image from "next/image";
import { Star, Clock, BookOpen } from "lucide-react";
import { SeriesData, formatDate, cn } from "@/lib/api";

interface SeriesCardProps {
  series: SeriesData;
  variant?: "default" | "compact" | "horizontal";
  showChapters?: boolean;
}

function FormatBadge({ format }: { format: string }) {
  const cls: Record<string, string> = {
    manhwa: "badge-manhwa",
    manhua: "badge-manhua",
    manga: "badge-manga",
    webtoon: "badge-webtoon",
    mangatoon: "badge-webtoon",
  };
  return (
    <span className={`badge ${cls[format] || "badge-manhwa"} font-mono`}>
      {format}
    </span>
  );
}

export function SeriesCard({ series, variant = "default", showChapters = true }: SeriesCardProps) {
  const { data, dataMetadata, chapters } = series;

  if (variant === "horizontal") {
    return (
      <Link href={`/series/${data.slug}`} className="flex gap-3 group hover:bg-bg-elevated rounded-xl p-2 -mx-2 transition-colors duration-200">
        <div className="relative w-16 h-20 shrink-0 rounded-lg overflow-hidden bg-bg-tertiary">
          {data.coverImage ? (
            <Image
              src={data.coverImage}
              alt={data.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="64px"
              unoptimized
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-text-dim">
              <BookOpen size={20} />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0 py-1">
          <p className="text-sm font-semibold text-text-primary group-hover:text-accent transition-colors line-clamp-2 leading-snug">
            {data.title}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <FormatBadge format={data.format} />
            {data.rating && (
              <span className="flex items-center gap-1 text-xs text-yellow-400">
                <Star size={10} fill="currentColor" />
                {data.rating}
              </span>
            )}
          </div>
          {showChapters && chapters && chapters.length > 0 && (
            <div className="mt-1.5 space-y-0.5">
              {chapters.slice(0, 2).map((ch) => (
                <div key={ch.chapterIndex} className="flex items-center justify-between">
                  <span className="text-xs text-accent">Ch. {ch.chapterIndex}</span>
                  <span className="text-xs text-text-muted">{formatDate(ch.createdAt)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </Link>
    );
  }

  if (variant === "compact") {
    return (
      <Link href={`/series/${data.slug}`} className="group flex flex-col shrink-0" style={{ width: 120 }}>
        <div className="relative w-full aspect-[3/4] rounded-lg overflow-hidden bg-bg-tertiary">
          {data.isHot && (
            <div className="absolute top-1.5 left-1.5 z-10 badge badge-hot text-[10px]">HOT</div>
          )}
          {data.coverImage ? (
            <Image
              src={data.coverImage}
              alt={data.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="120px"
              unoptimized
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-text-dim">
              <BookOpen size={24} />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
        <div className="mt-2 space-y-1">
          <p className="text-xs font-medium text-text-primary line-clamp-2 leading-snug group-hover:text-accent transition-colors">
            {data.title}
          </p>
          <div className="flex items-center gap-1.5">
            <FormatBadge format={data.format} />
            {data.rating && (
              <span className="flex items-center gap-0.5 text-[10px] text-yellow-400">
                <Star size={8} fill="currentColor" />
                {data.rating}
              </span>
            )}
          </div>
        </div>
      </Link>
    );
  }

  // Default card
  return (
    <Link
      href={`/series/${data.slug}`}
      className="group flex flex-col bg-bg-card border border-border hover:border-border-light rounded-xl overflow-hidden transition-all duration-300 hover:shadow-card-hover hover:-translate-y-0.5"
    >
      <div className="relative aspect-[3/4] bg-bg-tertiary overflow-hidden">
        {data.isHot && (
          <div className="absolute top-2 left-2 z-10 badge badge-hot">🔥 HOT</div>
        )}
        {data.coverImage ? (
          <Image
            src={data.coverImage}
            alt={data.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
            unoptimized
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-text-dim">
            <BookOpen size={40} />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
        {/* Bottom overlay info */}
        <div className="absolute bottom-0 left-0 right-0 p-3">
          {showChapters && chapters && chapters.length > 0 && (
            <div className="space-y-1">
              {chapters.slice(0, 2).map((ch) => (
                <div
                  key={ch.chapterIndex}
                  className="flex items-center justify-between"
                >
                  <span className="text-xs font-medium text-white/90">
                    Ch. {ch.chapterIndex}
                  </span>
                  <span className="text-[10px] text-white/60">
                    {formatDate(ch.createdAt)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="p-3 space-y-2">
        <h3 className="text-sm font-semibold text-text-primary line-clamp-2 leading-snug group-hover:text-accent transition-colors duration-200">
          {data.title}
        </h3>
        <div className="flex items-center justify-between">
          <FormatBadge format={data.format} />
          <div className="flex items-center gap-1 text-xs text-yellow-400">
            <Star size={11} fill="currentColor" />
            <span>{data.rating || "—"}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export function SeriesCardSkeleton() {
  return (
    <div className="flex flex-col bg-bg-card border border-border rounded-xl overflow-hidden">
      <div className="aspect-[3/4] skeleton" />
      <div className="p-3 space-y-2">
        <div className="skeleton h-4 rounded w-full" />
        <div className="skeleton h-3 rounded w-2/3" />
      </div>
    </div>
  );
}
