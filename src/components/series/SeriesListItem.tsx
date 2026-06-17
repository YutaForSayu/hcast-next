import Link from "next/link";
import Image from "next/image";
import { Star, Eye } from "lucide-react";
import { SeriesData, formatNumber } from "@/lib/api";

export function SeriesListItem({ series }: { series: SeriesData }) {
  const { data, dataMetadata, chapters } = series;
  return (
    <Link href={`/series/${data.slug}`}
      className="flex items-center gap-3 p-3 bg-bg-card border border-border/50 rounded-xl hover:border-accent/40 transition-colors group">
      <div className="relative w-12 h-16 rounded-lg overflow-hidden flex-shrink-0">
        {data.coverImage ? (
          <Image src={data.coverImage} alt={data.title} fill className="object-cover" unoptimized />
        ) : (
          <div className="w-full h-full bg-bg-tertiary" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-text-primary group-hover:text-accent transition-colors truncate">{data.title}</p>
        <div className="flex items-center gap-2 mt-1">
          <span className={`badge badge-${data.format}`}>{data.format}</span>
          {data.status && <span className={`badge badge-${data.status} text-[10px]`}>{data.status}</span>}
        </div>
      </div>
      <div className="flex flex-col items-end gap-1 text-xs text-text-muted flex-shrink-0">
        {data.rating && (
          <div className="flex items-center gap-1 text-yellow-400">
            <Star size={10} fill="currentColor" />{data.rating}
          </div>
        )}
        {dataMetadata?.totalViewsComputed && (
          <div className="flex items-center gap-1">
            <Eye size={10} />{formatNumber(dataMetadata.totalViewsComputed)}
          </div>
        )}
        {chapters && chapters[0] && <span className="text-accent">Ch.{chapters[0].chapterIndex}</span>}
      </div>
    </Link>
  );
}
