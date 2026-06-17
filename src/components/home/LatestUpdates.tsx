import Image from "next/image";
import Link from "next/link";
import { SeriesData, formatDate } from "@/lib/api";

export function LatestUpdates({ series }: { series: SeriesData[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {series.map((s) => (
        <LatestItem key={s.id} series={s} />
      ))}
    </div>
  );
}

function LatestItem({ series }: { series: SeriesData }) {
  const { data, chapters } = series;
  return (
    <div className="flex items-center gap-3 p-2.5 bg-bg-card rounded-xl border border-border/50 hover:border-accent/40 transition-colors group">
      <Link href={`/series/${data.slug}`} className="flex-shrink-0">
        <div className="relative w-12 h-16 rounded-lg overflow-hidden">
          {data.coverImage ? (
            <Image src={data.coverImage} alt={data.title} fill className="object-cover transition-transform group-hover:scale-105" unoptimized />
          ) : (
            <div className="w-full h-full bg-bg-tertiary" />
          )}
        </div>
      </Link>
      <div className="min-w-0 flex-1">
        <Link href={`/series/${data.slug}`}>
          <p className="text-sm font-semibold text-text-primary truncate group-hover:text-accent transition-colors">{data.title}</p>
        </Link>
        <div className="flex items-center gap-1.5 mt-1">
          <span className={`badge badge-${data.format} text-[10px]`}>{data.format}</span>
          {data.type === "project" && <span className="badge badge-ongoing text-[10px]">HCast</span>}
        </div>
        <div className="mt-1.5 space-y-0.5">
          {(chapters || []).slice(0, 3).map((ch) => (
            <Link key={ch.chapterIndex} href={`/series/${data.slug}/${ch.chapterIndex}`} className="flex items-center justify-between group/ch">
              <span className="text-xs text-accent hover:text-accent-hover transition-colors">Ch.{ch.chapterIndex}</span>
              <span className="text-[10px] text-text-muted">{formatDate(ch.createdAt)}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
