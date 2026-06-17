import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Star, BookOpen, Eye, Bookmark, TrendingUp, ChevronDown, ChevronUp, ArrowRight } from "lucide-react";
import { api, formatNumber, formatDate, formatStatus } from "@/lib/api";
import { CommentsSection } from "@/components/comments/CommentsSection";
import { ReactionsBar } from "@/components/series/ReactionsBar";
import { BookmarkButton } from "@/components/series/BookmarkButton";
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  try {
    const { slug } = await params;
    const res = await api.getSeriesDetail(slug);
    return { title: res.data.data.title, description: res.data.data.synopsis?.slice(0, 160) };
  } catch { return {}; }
}

export default async function SeriesDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [detailRes, chaptersRes] = await Promise.allSettled([
    api.getSeriesDetail(slug),
    api.getSeriesChapters(slug),
  ]);

  if (detailRes.status === "rejected") notFound();
  const series = detailRes.value.data;
  const chapters = chaptersRes.status === "fulfilled" ? chaptersRes.value.data : [];
  const { data, dataMetadata } = series;

  const firstChapter = chapters.length > 0 ? chapters[chapters.length - 1] : null;
  const latestChapter = chapters.length > 0 ? chapters[0] : null;

  return (
    <div className="min-h-screen">
      {/* Hero background */}
      <div className="relative">
        {data.backgroundImage && (
          <div className="absolute inset-0 h-72 overflow-hidden">
            <Image src={data.backgroundImage} alt="" fill className="object-cover" unoptimized priority />
            <div className="absolute inset-0 bg-gradient-to-b from-bg/60 via-bg/80 to-bg" />
          </div>
        )}
        <div className="relative hcast-container pt-8 pb-6">
          <div className="flex flex-col sm:flex-row gap-6">
            {/* Cover */}
            <div className="flex-shrink-0">
              <div className="relative w-36 sm:w-44 rounded-2xl overflow-hidden shadow-card border border-border/30">
                {data.coverImage ? (
                  <Image src={data.coverImage} alt={data.title} width={176} height={250} className="w-full object-cover" unoptimized priority />
                ) : (
                  <div className="w-full aspect-[3/4] bg-bg-tertiary flex items-center justify-center">
                    <BookOpen size={32} className="text-text-dim" />
                  </div>
                )}
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap gap-2 mb-3">
                <span className={`badge badge-${data.format}`}>{data.format}</span>
                {data.status && <span className={`badge badge-${data.status}`}>{formatStatus(data.status)}</span>}
                {data.isHot && <span className="badge badge-hot">🔥 Hot</span>}
                {data.animeAdaptation && <span className="badge badge-ongoing">Anime</span>}
                {data.type === "project" && <span className="badge badge-completed">HCast Project</span>}
              </div>
              <h1 className="font-display text-2xl sm:text-3xl font-bold text-text-primary mb-1 leading-tight">{data.title}</h1>
              {data.nativeTitle && <p className="text-text-muted text-sm mb-2">{data.nativeTitle}</p>}
              {data.author && <p className="text-sm text-text-secondary mb-3">By <span className="text-text-primary font-medium">{data.author}</span></p>}

              {/* Genres */}
              {data.genres && data.genres.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {data.genres.map(g => (
                    <Link key={g.id} href={`/browse?genre_ids=${g.id}`}
                      className="text-xs px-2.5 py-1 rounded-full bg-bg-elevated border border-border hover:border-accent/40 text-text-secondary hover:text-accent transition-colors">
                      {g.data.name}
                    </Link>
                  ))}
                </div>
              )}

              {/* Stats */}
              <div className="flex flex-wrap gap-4 mb-5 text-sm">
                {data.rating && (
                  <div className="flex items-center gap-1.5">
                    <Star size={14} className="text-yellow-400" fill="currentColor" />
                    <span className="font-bold text-yellow-400">{data.rating}</span>
                    <span className="text-text-muted">/10</span>
                  </div>
                )}
                {dataMetadata?.totalViewsComputed && (
                  <div className="flex items-center gap-1.5 text-text-secondary">
                    <Eye size={14} />
                    <span>{formatNumber(dataMetadata.totalViewsComputed)} views</span>
                  </div>
                )}
                {dataMetadata?.bookmarkCount && (
                  <div className="flex items-center gap-1.5 text-text-secondary">
                    <Bookmark size={14} />
                    <span>{formatNumber(dataMetadata.bookmarkCount)} saved</span>
                  </div>
                )}
                {dataMetadata?.ranking && (
                  <div className="flex items-center gap-1.5 text-text-secondary">
                    <TrendingUp size={14} />
                    <span>Rank #{dataMetadata.ranking}</span>
                  </div>
                )}
                {data.totalChapters && (
                  <div className="flex items-center gap-1.5 text-text-secondary">
                    <BookOpen size={14} />
                    <span>{data.totalChapters} chapters</span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-2">
                {firstChapter && (
                  <Link href={`/series/${slug}/${firstChapter.data.index}`} className="btn-primary">
                    <BookOpen size={16} /> Read First
                  </Link>
                )}
                {latestChapter && (
                  <Link href={`/series/${slug}/${latestChapter.data.index}`} className="btn-secondary">
                    <ArrowRight size={16} /> Latest Ch.{latestChapter.data.index}
                  </Link>
                )}
                <BookmarkButton slug={slug} title={data.title} coverImage={data.coverImage} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="hcast-container pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-8">
          <div>
            {/* Synopsis */}
            {data.synopsis && <Synopsis text={data.synopsis} />}

            {/* Reactions */}
            <div className="my-6 p-4 bg-bg-card border border-border rounded-xl">
              <ReactionsBar slug={slug} />
            </div>

            {/* Chapters */}
            <ChaptersList chapters={chapters} slug={slug} />

            {/* Comments */}
            <CommentsSection slug={slug} />
          </div>

          {/* Sidebar */}
          <aside className="space-y-4">
            <div className="bg-bg-card border border-border rounded-xl p-4">
              <h3 className="font-display font-bold text-sm text-text-primary mb-3">Details</h3>
              <dl className="space-y-2 text-sm">
                {data.releaseDate && <Row label="Released" value={data.releaseDate} />}
                <Row label="Format" value={data.format} />
                <Row label="Status" value={formatStatus(data.status)} />
                {data.totalChapters && <Row label="Chapters" value={data.totalChapters} />}
                {dataMetadata?.weeklyViews && <Row label="Weekly Views" value={formatNumber(dataMetadata.weeklyViews)} />}
                {dataMetadata?.monthlyViews && <Row label="Monthly Views" value={formatNumber(dataMetadata.monthlyViews)} />}
              </dl>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function Synopsis({ text }: { text: string }) {
  return (
    <div className="mb-6">
      <h2 className="font-display font-bold text-text-primary mb-2">Synopsis</h2>
      <p className="text-text-secondary text-sm leading-relaxed">{text}</p>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string | undefined }) {
  if (!value) return null;
  return (
    <div className="flex justify-between">
      <dt className="text-text-muted">{label}</dt>
      <dd className="text-text-primary font-medium capitalize">{value}</dd>
    </div>
  );
}

function ChaptersList({ chapters, slug }: { chapters: any[]; slug: string }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-display font-bold text-text-primary flex items-center gap-2">
          <BookOpen size={16} className="text-accent" />
          Chapters ({chapters.length})
        </h2>
      </div>
      <div className="bg-bg-card border border-border rounded-xl divide-y divide-border/50 overflow-hidden max-h-[480px] overflow-y-auto">
        {chapters.map(ch => (
          <Link key={ch.id} href={`/series/${slug}/${ch.data.index}`}
            className="flex items-center justify-between px-4 py-2.5 hover:bg-bg-elevated transition-colors group">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-text-primary group-hover:text-accent transition-colors">
                Chapter {ch.data.index}
                {ch.data.title && <span className="text-text-muted ml-2 text-xs">— {ch.data.title}</span>}
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs text-text-muted">
              {ch.views?.total > 0 && <span><Eye size={10} className="inline mr-0.5" />{formatNumber(ch.views.total)}</span>}
              <span>{formatDate(ch.createdAt)}</span>
            </div>
          </Link>
        ))}
        {chapters.length === 0 && (
          <p className="text-text-muted text-sm text-center py-8">No chapters available</p>
        )}
      </div>
    </div>
  );
}
